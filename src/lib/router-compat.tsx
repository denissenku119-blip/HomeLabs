/**
 * Thin compatibility layer so the app's original react-router-dom usage keeps
 * working on top of TanStack Router (the router used by this project).
 */
import {
  Link as TanStackLink,
  useNavigate as useTanStackNavigate,
  useParams as useTanStackParams,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback, type AnchorHTMLAttributes, type ReactNode } from "react";

type BaseAnchorProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "className" | "children"
>;

export interface LinkProps extends BaseAnchorProps {
  to: string;
  replace?: boolean;
  state?: unknown;
  className?: string;
  children?: ReactNode;
}

export function Link({ to, replace, state, ...rest }: LinkProps) {
  return (
    <TanStackLink
      to={to as never}
      replace={replace as never}
      state={state as never}
      {...(rest as Record<string, unknown>)}
    />
  );
}

export interface NavLinkProps extends BaseAnchorProps {
  to: string;
  end?: boolean;
  className?: string | ((props: { isActive: boolean }) => string);
  children?: ReactNode | ((props: { isActive: boolean }) => ReactNode);
}

export function NavLink({ to, end, className, children, ...rest }: NavLinkProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <TanStackLink
      to={to as never}
      className={typeof className === "function" ? className({ isActive }) : className}
      {...(rest as Record<string, unknown>)}
    >
      {typeof children === "function" ? children({ isActive }) : children}
    </TanStackLink>
  );
}

export interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

export function useNavigate() {
  const navigate = useTanStackNavigate();
  const router = useRouter();

  return useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === "number") {
        if (to < 0) router.history.back();
        else if (to > 0) router.history.forward();
        return;
      }
      navigate({
        to: to as never,
        replace: options?.replace as never,
        state: options?.state as never,
      });
    },
    [navigate, router],
  );
}

export function useParams<T extends Record<string, string | undefined>>(): T {
  return useTanStackParams({ strict: false } as never) as T;
}

export function useLocation() {
  return useRouterState({ select: (s) => s.location });
}
