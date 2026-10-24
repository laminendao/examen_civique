-- Signalements d'erreurs (bouton « Signaler une erreur » sous chaque question).
-- À exécuter une fois dans Supabase > SQL Editor > New query > Run.
-- Les signalements se lisent dans Supabase > Table Editor > reports (personne ne peut les lire depuis le site).

create table if not exists public.reports (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  exam        text not null check (char_length(exam) <= 60),
  question_id text not null check (char_length(question_id) <= 20),
  question    text not null check (char_length(question) <= 600),
  message     text not null check (char_length(message) between 3 and 1000),
  user_id     uuid references auth.users(id) on delete set null,
  status      text not null default 'nouveau'   -- à changer à la main : vu, corrigé, rejeté
);

alter table public.reports enable row level security;

drop policy if exists "reports_insert" on public.reports;
-- Tout le monde peut envoyer un signalement ; un utilisateur connecté ne peut signer qu'à son nom.
create policy "reports_insert" on public.reports
  for insert to anon, authenticated
  with check ((user_id is null or user_id = auth.uid()) and status = 'nouveau');
-- Aucune politique de lecture, de modification ni de suppression : seul le tableau de bord Supabase y a accès.
