-- Run this in your Supabase project: SQL Editor → New Query → Paste & Run

-- 1. Listings table
create table listings (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  category    text not null,
  price       numeric not null,
  condition   text not null default 'New',
  status      text not null default 'available',
  description text,
  photo_url   text,
  photos      text[] default '{}',
  created_at  timestamptz default now()
);

-- 2. Viewing bookings table
create table viewing_bookings (
  id             text primary key,
  listing_id     uuid,
  listing_name   text,
  customer_name  text,
  customer_email text,
  customer_phone text,
  date           text,
  time           text,
  status         text default 'pending',
  created_at     timestamptz default now()
);

-- 3. Staging bookings table
create table staging_bookings (
  id              text primary key,
  name            text,
  email           text,
  phone           text,
  address         text,
  service         text,
  date            text,
  notes           text,
  status          text default 'pending',
  quote_sent      boolean default false,
  quote_amount    numeric,
  quote_breakdown text,
  created_at      timestamptz default now()
);

-- 4. Staging inspiration gallery
create table staging_inspiration (
  id          uuid default gen_random_uuid() primary key,
  title       text not null,
  tag         text not null,
  description text,
  idea        text,
  photo_url   text,
  photos      text[] default '{}',
  created_at  timestamptz default now()
);

-- 5. Row-level security (permissive for demo — tighten before going to production)
alter table listings              enable row level security;
alter table viewing_bookings      enable row level security;
alter table staging_bookings      enable row level security;
alter table staging_inspiration   enable row level security;

create policy "Public all listings"             on listings             for all using (true) with check (true);
create policy "Public all viewing_bookings"     on viewing_bookings     for all using (true) with check (true);
create policy "Public all staging_bookings"     on staging_bookings     for all using (true) with check (true);
create policy "Public all staging_inspiration"  on staging_inspiration  for all using (true) with check (true);

-- 5. Storage bucket for listing photos
-- After running the SQL above, go to:
--   Storage → New bucket → Name: "listing-photos" → Public: ON
