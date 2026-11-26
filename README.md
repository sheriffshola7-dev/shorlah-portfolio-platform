# Shorlah Cloud Portfolio Platform

A standalone, mobile-friendly portfolio and case-study CMS powered by React, Vite and Supabase.

## Features
- Public portfolio with category filters, project search and individual case-study pages
- Public profile, skills and social links
- Contact/enquiry form stored in Supabase
- Admin sign-in, profile editing, project/category management and media uploads
- Responsive black, white and green visual system
- No demo projects, fabricated testimonials or invented performance metrics

## Setup
1. Copy `.env.example` to `.env`.
2. Set `VITE_SUPABASE_URL` to the Shorlah portfolio Supabase project URL.
3. Set `VITE_SUPABASE_PUBLISHABLE_KEY` to its publishable key.
4. Run `npm install` and `npm run dev`.

## Build
`npm run build`

## Admin access
Create an account through `/admin`. The first account should be the portfolio owner. Configure Supabase Auth email confirmation and the production redirect URL before public launch.

## Database
This frontend expects the existing Supabase schema: profiles, categories, projects, project_media, project_categories, testimonials and enquiries. Media is stored in the `portfolio-media` bucket.

Never place a Supabase service-role key in this frontend. Only the public publishable key belongs in browser environment variables.
