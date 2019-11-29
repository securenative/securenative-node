export interface SecurityHeaderOption<T> {
  enabled: boolean;
  action: boolean;
  header: string;
  value?: T;
}

export type SecurityHeaders = {
  csp?: SecurityHeaderOption<string>;
  permittedCrossDomainPolicies?: SecurityHeaderOption<string>;
  frameOptions?: SecurityHeaderOption<string>;
  poweredBy?: SecurityHeaderOption<string>;
  strictTransportSecurity?: SecurityHeaderOption<string>;
  ieNoOpen?: SecurityHeaderOption<string>;
  mimeType?: SecurityHeaderOption<string>;
  referrerPolicy?: SecurityHeaderOption<string>;
  xssProtection?: SecurityHeaderOption<number | string>;
};
