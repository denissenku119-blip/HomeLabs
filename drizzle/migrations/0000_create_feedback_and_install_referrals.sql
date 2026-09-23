CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('bug','feature','suggestion','general','other')),
  subject text,
  message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 2000),
  email text CHECK (email IS NULL OR char_length(email) <= 254),
  app_version text CHECK (app_version IS NULL OR char_length(app_version) <= 32),
  platform text CHECK (platform IS NULL OR char_length(platform) <= 32),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.feedback TO anon;
GRANT INSERT ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON public.feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE TABLE public.install_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  utm_source text CHECK (utm_source IS NULL OR char_length(utm_source) <= 64),
  utm_medium text CHECK (utm_medium IS NULL OR char_length(utm_medium) <= 64),
  utm_campaign text CHECK (utm_campaign IS NULL OR char_length(utm_campaign) <= 64),
  raw_referrer text CHECK (raw_referrer IS NULL OR char_length(raw_referrer) <= 512),
  platform text CHECK (platform IS NULL OR char_length(platform) <= 32),
  app_version text CHECK (app_version IS NULL OR char_length(app_version) <= 32),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.install_referrals TO anon;
GRANT INSERT ON public.install_referrals TO authenticated;
GRANT ALL ON public.install_referrals TO service_role;

ALTER TABLE public.install_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record an install referral"
  ON public.install_referrals FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);