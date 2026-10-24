-- Examen civique CR : base de données des comptes
-- À exécuter une seule fois dans Supabase > SQL Editor > New query > Run.

-- Une ligne par utilisateur : toute sa progression au format JSON.
create table if not exists public.progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Sécurité : chaque utilisateur ne peut lire et modifier que sa propre ligne.
alter table public.progress enable row level security;

drop policy if exists "progress_select_own" on public.progress;
drop policy if exists "progress_insert_own" on public.progress;
drop policy if exists "progress_update_own" on public.progress;

create policy "progress_select_own" on public.progress
  for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Suppression de compte par l'utilisateur lui-même (bouton « Supprimer mon compte »).
-- Supprime l'utilisateur connecté ; sa progression est effacée automatiquement (on delete cascade).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;


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
