import { APP_NAME } from '@/config/app';

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDocument {
  id: 'privacy' | 'terms' | 'disclaimer';
  title: string;
  summary: string;
  updated: string;
  sections: LegalSection[];
}

export const LEGAL_UPDATED = 'September 2026';

export const privacyPolicy: LegalDocument = {
  id: 'privacy',
  title: 'Privacy Policy',
  summary: `How ${APP_NAME} handles your information.`,
  updated: LEGAL_UPDATED,
  sections: [
    {
      heading: 'Summary',
      body: [
        `${APP_NAME} is an offline-first planning tool. It does not require an account, and it does not send your projects to us or to anyone else. Everything you create stays in the storage of the device or browser you used to create it.`,
      ],
    },
    {
      heading: 'Information stored on your device',
      body: [
        'Projects you create: their name, the hardware components you add, their positions on the canvas, the connections between them, and any custom hardware you define.',
        'Preferences: your chosen language, default currency, default voltage and electricity rate.',
        'App state: whether you have completed the first-run guide, and whether Pro has been unlocked on this device.',
        'A copy of any feedback you submit through the in-app feedback page.',
      ],
    },
    {
      heading: 'Information we collect',
      body: [
        'Feedback you choose to send: the category, subject, message, the email address you optionally provide, the app version and the platform name (for example "android"). Nothing is submitted unless you press Submit, and no account is required.',
        'If the app was installed from a shared store link, the campaign labels attached to that link (for example "app_share") are recorded once so we can see that sharing works. This contains no personal information and no device identifier.',
        'There is no analytics service, no advertising SDK, no tracking identifier and no user account system in this application.',
      ],
    },
    {
      heading: 'Network access',
      body: [
        'The application works without an internet connection. A connection is only used to load the web version of the app and its fonts, to submit feedback you send, and for any link you deliberately open. Your projects are never transmitted.',
      ],
    },
    {
      heading: 'Deleting your data',
      body: [
        'Deleting a project inside the app removes it from your device immediately. Uninstalling the app, or clearing the site data in your browser, removes all stored projects, preferences and local feedback copies. Feedback you sent to us can be deleted on request through the contact route below.',
      ],
    },
    {
      heading: 'Children',
      body: [
        'The app is a general-purpose technical planning tool and is not directed at children. It does not knowingly collect information from anyone.',
      ],
    },
    {
      heading: 'Changes',
      body: [
        'If this policy changes — for example if optional cloud sync or purchases are added in a future version — the updated policy will be published in the app before those features are enabled.',
      ],
    },
    {
      heading: 'Contact',
      body: [
        'Questions about privacy, or requests to delete feedback you have sent, can be submitted through the in-app Feedback page. Include your email address there if you would like a reply.',
      ],
    },
  ],
};

export const termsOfUse: LegalDocument = {
  id: 'terms',
  title: 'Terms of Use',
  summary: `The rules that apply when you use ${APP_NAME}.`,
  updated: LEGAL_UPDATED,
  sections: [
    {
      heading: 'Acceptance',
      body: [
        `By installing or using ${APP_NAME} you agree to these terms. If you do not agree, please stop using the app.`,
      ],
    },
    {
      heading: 'What the app does',
      body: [
        `${APP_NAME} lets you design a home lab layout, add hardware components, connect them, and view estimated cost, power draw, storage capacity and network figures for that design. It is a planning and estimation tool. It does not sell, configure, monitor or manage any real hardware.`,
      ],
    },
    {
      heading: 'Your content',
      body: [
        'The projects and custom hardware definitions you create belong to you. They are stored on your device and we claim no rights over them. You are responsible for keeping your own backups; the app does not provide cloud backup.',
      ],
    },
    {
      heading: 'Acceptable use',
      body: [
        'Do not use the app to break the law, and do not attempt to modify, decompile or redistribute it in a way that infringes the rights of its authors or of third parties.',
      ],
    },
    {
      heading: 'Pro purchase',
      body: [
        'Pro is offered as a single one-time purchase of $29.99 USD that unlocks unlimited projects, the full hardware library and unlimited custom hardware on the device where it is purchased. It is not a subscription and it does not renew. Payment processing is not enabled in this build; no charge can currently be made. When purchasing is enabled, the payment, refund and restore rules of the app store used for the purchase will apply.',
      ],
    },
    {
      heading: 'Availability',
      body: [
        'The app is provided as-is. Features may change between versions, and we do not guarantee that any particular feature, hardware entry or estimate will remain available or unchanged.',
      ],
    },
    {
      heading: 'Limitation of liability',
      body: [
        'To the maximum extent permitted by law, the authors are not liable for purchasing decisions made using the app, for hardware incompatibility, for lost project data, or for any indirect or consequential loss arising from use of the app.',
      ],
    },
    {
      heading: 'Changes to these terms',
      body: [
        'These terms may be updated as the app develops. The current version is always available inside the app.',
      ],
    },
  ],
};

export const disclaimer: LegalDocument = {
  id: 'disclaimer',
  title: 'Disclaimer',
  summary: 'What the estimates in this app do and do not mean.',
  updated: LEGAL_UPDATED,
  sections: [
    {
      heading: 'Estimates only',
      body: [
        'Cost, power consumption, storage capacity and network figures shown in the app are estimates. They are derived from typical published specifications and from the values you enter for custom hardware. Real hardware varies with workload, firmware, configuration, ambient conditions and regional pricing.',
      ],
    },
    {
      heading: 'Prices and specifications',
      body: [
        'Prices are indicative reference figures and are not quotes or offers. They do not include tax, shipping or local market variation. Always confirm current pricing and full specifications with the manufacturer or retailer before buying anything.',
      ],
    },
    {
      heading: 'Not professional advice',
      body: [
        'The analysis produced by the app is not electrical, structural, network-security or professional engineering advice. Mains wiring, circuit loading, rack mounting and similar work should be reviewed by a qualified professional and must follow local regulations.',
      ],
    },
    {
      heading: 'No affiliation',
      body: [
        'Hardware names, models and manufacturers referenced in the library are used for identification only. Their presence does not imply any endorsement, partnership or affiliation.',
      ],
    },
    {
      heading: 'Your responsibility',
      body: [
        'You remain responsible for every purchase and installation decision you make. Use the reports as a planning aid, not as a guarantee of the result.',
      ],
    },
  ],
};

export const legalDocuments: Record<LegalDocument['id'], LegalDocument> = {
  privacy: privacyPolicy,
  terms: termsOfUse,
  disclaimer,
};
