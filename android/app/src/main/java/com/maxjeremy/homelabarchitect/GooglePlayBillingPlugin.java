package com.maxjeremy.homelabarchitect;

import androidx.annotation.NonNull;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Google Play Billing (Play Billing Library 8) bridge for HomeLab Architect.
 *
 * Supports ONE one-time in-app product (INAPP). No subscriptions.
 * Ownership reported here is a client-side check only; production-grade
 * verification requires a server that validates purchase tokens with the
 * Google Play Developer API.
 */
@CapacitorPlugin(name = "GooglePlayBilling")
public class GooglePlayBillingPlugin extends Plugin implements PurchasesUpdatedListener {

    private BillingClient billingClient;
    private final List<Runnable> pendingWhenReady = new ArrayList<>();
    private boolean connecting = false;
    private PluginCall activePurchaseCall;
    private String activeProductId;

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()
            )
            .enableAutoServiceReconnection()
            .build();
    }

    private void whenReady(Runnable task, PluginCall call) {
        if (billingClient.isReady()) {
            task.run();
            return;
        }
        pendingWhenReady.add(task);
        if (connecting) return;
        connecting = true;
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult result) {
                connecting = false;
                List<Runnable> tasks = new ArrayList<>(pendingWhenReady);
                pendingWhenReady.clear();
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    for (Runnable r : tasks) r.run();
                } else if (call != null) {
                    rejectWith(call, result);
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                connecting = false;
            }
        });
    }

    private static String codeFor(int responseCode) {
        switch (responseCode) {
            case BillingClient.BillingResponseCode.USER_CANCELED: return "USER_CANCELED";
            case BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED: return "ALREADY_OWNED";
            case BillingClient.BillingResponseCode.ITEM_UNAVAILABLE: return "PRODUCT_NOT_FOUND";
            case BillingClient.BillingResponseCode.BILLING_UNAVAILABLE:
            case BillingClient.BillingResponseCode.SERVICE_UNAVAILABLE:
            case BillingClient.BillingResponseCode.SERVICE_DISCONNECTED:
            case BillingClient.BillingResponseCode.FEATURE_NOT_SUPPORTED:
                return "BILLING_UNAVAILABLE";
            case BillingClient.BillingResponseCode.NETWORK_ERROR: return "NETWORK_ERROR";
            default: return "PURCHASE_FAILED";
        }
    }

    private void rejectWith(PluginCall call, BillingResult result) {
        call.reject(result.getDebugMessage(), codeFor(result.getResponseCode()));
    }

    private ProductDetails lastDetails;

    private void loadDetails(String productId, PluginCall call, DetailsCallback cb) {
        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
            .setProductList(Collections.singletonList(
                QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(productId)
                    .setProductType(BillingClient.ProductType.INAPP)
                    .build()))
            .build();
        billingClient.queryProductDetailsAsync(params, (result, detailsResult) -> {
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                rejectWith(call, result);
                return;
            }
            List<ProductDetails> list = detailsResult.getProductDetailsList();
            if (list == null || list.isEmpty()) {
                call.reject("Product not found: " + productId, "PRODUCT_NOT_FOUND");
                return;
            }
            lastDetails = list.get(0);
            cb.onDetails(lastDetails);
        });
    }

    private interface DetailsCallback { void onDetails(ProductDetails details); }

    @PluginMethod
    public void isReady(PluginCall call) {
        whenReady(() -> {
            JSObject ret = new JSObject();
            ret.put("ready", true);
            call.resolve(ret);
        }, call);
    }

    @PluginMethod
    public void getProduct(PluginCall call) {
        String productId = call.getString("productId");
        if (productId == null) { call.reject("productId required", "PURCHASE_FAILED"); return; }
        whenReady(() -> loadDetails(productId, call, details -> {
            ProductDetails.OneTimePurchaseOfferDetails offer = details.getOneTimePurchaseOfferDetails();
            if (offer == null) { call.reject("No one-time offer", "PRODUCT_NOT_FOUND"); return; }
            JSObject ret = new JSObject();
            ret.put("productId", details.getProductId());
            ret.put("title", details.getTitle());
            ret.put("name", details.getName());
            ret.put("description", details.getDescription());
            ret.put("formattedPrice", offer.getFormattedPrice());
            ret.put("priceAmountMicros", offer.getPriceAmountMicros());
            ret.put("priceCurrencyCode", offer.getPriceCurrencyCode());
            call.resolve(ret);
        }), call);
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId");
        if (productId == null) { call.reject("productId required", "PURCHASE_FAILED"); return; }
        if (activePurchaseCall != null) { call.reject("Purchase already in progress", "PURCHASE_FAILED"); return; }
        whenReady(() -> loadDetails(productId, call, details -> {
            BillingFlowParams flow = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(Collections.singletonList(
                    BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(details)
                        .build()))
                .build();
            call.setKeepAlive(true);
            activePurchaseCall = call;
            activeProductId = productId;
            getActivity().runOnUiThread(() -> {
                BillingResult launch = billingClient.launchBillingFlow(getActivity(), flow);
                if (launch.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    finishPurchaseCallWithError(launch);
                }
            });
        }), call);
    }

    @Override
    public void onPurchasesUpdated(@NonNull BillingResult result, List<Purchase> purchases) {
        if (activePurchaseCall == null) {
            // Late/out-of-band update (e.g. a pending purchase completing): acknowledge silently.
            if (purchases != null) for (Purchase p : purchases) acknowledgeIfNeeded(p, null);
            return;
        }
        int code = result.getResponseCode();
        if (code == BillingClient.BillingResponseCode.OK && purchases != null) {
            Purchase match = null;
            for (Purchase p : purchases) {
                if (p.getProducts().contains(activeProductId)) { match = p; break; }
            }
            if (match == null) { finishPurchaseCallWithError(result); return; }
            final Purchase purchase = match;
            if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
                PluginCall c = activePurchaseCall;
                clearActive();
                c.resolve(purchaseToJs(purchase, "PENDING"));
                c.release(getBridge());
                return;
            }
            acknowledgeIfNeeded(purchase, () -> {
                PluginCall c = activePurchaseCall;
                clearActive();
                if (c != null) {
                    c.resolve(purchaseToJs(purchase, "PURCHASED"));
                    c.release(getBridge());
                }
            });
        } else {
            finishPurchaseCallWithError(result);
        }
    }

    private void acknowledgeIfNeeded(Purchase purchase, Runnable onDone) {
        if (purchase.getPurchaseState() != Purchase.PurchaseState.PURCHASED || purchase.isAcknowledged()) {
            if (onDone != null) onDone.run();
            return;
        }
        AcknowledgePurchaseParams params = AcknowledgePurchaseParams.newBuilder()
            .setPurchaseToken(purchase.getPurchaseToken())
            .build();
        billingClient.acknowledgePurchase(params, ackResult -> {
            if (onDone == null) return;
            if (ackResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                onDone.run();
            } else {
                finishPurchaseCallWithError(ackResult);
            }
        });
    }

    private void finishPurchaseCallWithError(BillingResult result) {
        PluginCall c = activePurchaseCall;
        clearActive();
        if (c != null) {
            rejectWith(c, result);
            c.release(getBridge());
        }
    }

    private void clearActive() {
        activePurchaseCall = null;
        activeProductId = null;
    }

    private JSObject purchaseToJs(Purchase p, String state) {
        JSObject o = new JSObject();
        JSArray products = new JSArray();
        for (String id : p.getProducts()) products.put(id);
        o.put("products", products);
        o.put("state", state);
        o.put("acknowledged", p.isAcknowledged() || "PURCHASED".equals(state));
        o.put("purchaseToken", p.getPurchaseToken());
        o.put("orderId", p.getOrderId());
        o.put("purchaseTime", p.getPurchaseTime());
        return o;
    }

    @PluginMethod
    public void getPurchases(PluginCall call) {
        whenReady(() -> billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),
            (result, list) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    rejectWith(call, result);
                    return;
                }
                JSArray arr = new JSArray();
                for (Purchase p : list) {
                    String state = p.getPurchaseState() == Purchase.PurchaseState.PURCHASED ? "PURCHASED"
                        : p.getPurchaseState() == Purchase.PurchaseState.PENDING ? "PENDING" : "UNSPECIFIED";
                    // Restore path: make sure previously completed purchases are acknowledged.
                    acknowledgeIfNeeded(p, null);
                    arr.put(purchaseToJs(p, state));
                }
                JSObject ret = new JSObject();
                ret.put("purchases", arr);
                call.resolve(ret);
            }), call);
    }
}
