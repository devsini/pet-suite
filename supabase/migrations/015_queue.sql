-- 015_queue.sql

create table if not exists queue_counters (
  queue_date date primary key,
  last_number int not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function generate_queue_number(queue_date date)
returns int language plpgsql security definer as $$
declare
  result int;
begin
  loop
    update queue_counters
    set last_number = last_number + 1,
        updated_at = now()
    where queue_date = generate_queue_number.queue_date
    returning last_number into result;

    if found then
      return result;
    end if;

    begin
      insert into queue_counters (queue_date, last_number, updated_at)
      values (generate_queue_number.queue_date, 1, now());
      return 1;
    exception when unique_violation then
      null;
    end;
  end loop;
end;
$$;

alter table queue_counters enable row level security;
create policy queue_counters_owner_full on queue_counters for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy queue_counters_staff_read on queue_counters for select using (auth.role() = 'staff');
create policy queue_counters_doctor_read on queue_counters for select using (auth.role() = 'doctor');
create policy queue_counters_customer_none on queue_counters for select using (false);
