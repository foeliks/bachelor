# Generated by Django 3.1.2 on 2020-10-20 12:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('robob', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            """
			-- UPDATE auth_user

			alter table auth_user add game_mode boolean default false;

			

            -- CREATE TABLES

            create table if not exists categories (
            	id serial,
            	title text not null,
            	description text,
            	primary key (id)
            );

	        create table if not exists narrators (
	        	id serial,
	        	name text,
	        	primary key(id)
	        );

	        create table if not exists conversations (
	        	id serial,
	        	content text,
	        	narrator_id integer references narrators (id),
	        	next_id integer references conversations (id),
	        	primary key (id)
	        );

			create table if not exists places (
				id serial,
				name text,
				primary key(id)
			);

            create table if not exists knowledge (
            	id serial,
            	category_id integer references categories (id),
            	description text not null,
            	optional bool default false,
	        	conversation integer references conversations (id),
				place_id integer references places(id),
            	primary key (id)
            );

            create table if not exists tasks (
            	id serial,
            	category_id integer references categories (id),
            	knowledge_id integer references knowledge (id),
            	description text not null,
            	optional bool default false,
            	solution text,
	        	multiple_choice bool default false,
				placeholder_before text default '',
				placeholder_after text default '',
            	primary key (id)
            );

            create table if not exists progress (
            	user_id integer references auth_user (id),
            	task_id integer references tasks (id),
            	solved bool,
            	num_tries integer,
            	user_solution text,
            	primary key (user_id, task_id, num_tries)
            );

            create table if not exists diary (
            	user_id integer references auth_user (id),
            	knowledge integer references knowledge (id),
				post_it boolean default(false),
            	primary key (knowledge, user_id)
            );

			


	        -- IMPORT DATA FROM CSV 

	        do
	        $$
	        begin
	        	copy auth_user
	        	from '/tmp/auth_user.csv'
	        	delimiter ','
	        	csv header;	

	        	exception
	        		when undefined_file then
	        			raise notice '/tmp/auth_user.csv was not found.';
	        end;
	        $$
	        language plpgsql;

	        do
	        $$
	        begin
	        	copy categories
	        	from '/tmp/categories.csv'
	        	delimiter ','
	        	csv header;

	        	exception
	        		when undefined_file then
	        			raise notice '/tmp/categories.csv was not found.';
	        end;
	        $$
	        language plpgsql;

	        do
	        $$
	        begin
	        	copy narrators
	        	from '/tmp/narrators.csv'
	        	delimiter ','
	        	csv header;

	        	exception
	        		when undefined_file then
	        			raise notice '/tmp/narrators.csv was not found.';
	        end;
	        $$
	        language plpgsql;

	        do
	        $$
	        begin
	        	copy conversations
	        	from '/tmp/conversations.csv'
	        	delimiter ','
	        	csv header;

	        	exception
	        		when undefined_file then
	        			raise notice '/tmp/conversations.csv was not found.';
	        end;
	        $$
	        language plpgsql;

	        do
	        $$
	        begin
	        	copy knowledge
	        	from '/tmp/knowledge.csv'
	        	delimiter ','
	        	csv header;

	        	exception
	        		when undefined_file then
	        			raise notice '/tmp/knowledge.csv was not found.';
	        end;
	        $$
	        language plpgsql;

	        do
	        $$
	        begin
	        	copy tasks
	        	from '/tmp/tasks.csv'
	        	delimiter ','
	        	csv header;

	        	exception
	        		when undefined_file then
	        			raise notice '/tmp/tasks.csv was not found.';
	        end;
	        $$
	        language plpgsql;

	        do
	        $$
	        begin
	        	copy progress
	        	from '/tmp/progress.csv'
	        	delimiter ','
	        	csv header;

	        	exception
	        		when undefined_file then
	        			raise notice '/tmp/progress.csv was not found.';
	        end;
	        $$
	        language plpgsql;

	        do
	        $$
	        begin
	        	copy diary
	        	from '/tmp/diary.csv'
	        	delimiter ','
	        	csv header;

	        	exception
	        		when undefined_file then
	        			raise notice '/tmp/diary.csv was not found.';
	        end;
	        $$
	        language plpgsql;


	        -- UPDATE SERIAL COUNTER
	        select setval('auth_user_id_seq', max(id)) from auth_user;
	        select setval('categories_id_seq', max(id)) from categories;
	        select setval('narrators_id_seq', max(id)) from narrators;
	        select setval('conversations_id_seq', max(id)) from conversations;
	        select setval('knowledge_id_seq', max(id)) from knowledge;
	        select setval('tasks_id_seq', max(id)) from tasks;


	        -- CREATE TRIGGER FOR EXPORT DATA INTO CSV 

	        drop trigger if exists auth_user_trigger on auth_user;
	        drop trigger if exists categories_trigger on categories;
	        drop trigger if exists narrator_trigger on narrators;
	        drop trigger if exists conversations_trigger on conversations;
	        drop trigger if exists knowledge_trigger on knowledge;
	        drop trigger if exists tasks_trigger on tasks;
	        drop trigger if exists progress_trigger on progress; 
	        drop trigger if exists diary_trigger on diary;

	        create or replace function auth_user_export()
	        	returns trigger 
	        	language plpgsql
	        	as 
	        $$
	        begin
	        	copy auth_user 
	        	to '/tmp/auth_user.csv'
	        	delimiter ','
	        	csv header;
	        	return null;
	        end;
	        $$;

	        create trigger auth_user_trigger
	        after insert or delete or update
	        on auth_user 
	        for each statement 
	        execute procedure auth_user_export();

	        create or replace function categories_export()
	        	returns trigger 
	        	language plpgsql
	        	as 
	        $$
	        begin
	        	copy categories
	        	to '/tmp/categories.csv'
	        	delimiter ','
	        	csv header;
	        	return null;
	        end;
	        $$;

	        create trigger categories_trigger
	        after insert or delete or update
	        on categories
	        for each statement 
	        execute procedure categories_export();

	        create or replace function narrators_export()
	        	returns trigger 
	        	language plpgsql
	        	as 
	        $$
	        begin
	        	copy narrators
	        	to '/tmp/narrators.csv'
	        	delimiter ','
	        	csv header;
	        	return null;
	        end;
	        $$;

	        create trigger narrators_trigger
	        after insert or delete or update
	        on narrators
	        for each statement 
	        execute procedure narrators_export();

	        create or replace function conversations_export()
	        	returns trigger 
	        	language plpgsql
	        	as 
	        $$
	        begin
	        	copy conversations
	        	to '/tmp/conversations.csv'
	        	delimiter ','
	        	csv header;
	        	return null;
	        end;
	        $$;

	        create trigger conversations_trigger
	        after insert or delete or update
	        on conversations
	        for each statement 
	        execute procedure conversations_export();

	        create or replace function knowledge_export()
	        	returns trigger 
	        	language plpgsql
	        	as 
	        $$
	        begin
	        	copy knowledge
	        	to '/tmp/knowledge.csv'
	        	delimiter ','
	        	csv header;
	        	return null;
	        end;
	        $$;

	        create trigger knowledge_trigger
	        after insert or delete or update
	        on knowledge
	        for each statement 
	        execute procedure knowledge_export();

	        create or replace function tasks_export()
	        	returns trigger 
	        	language plpgsql
	        	as 
	        $$
	        begin
	        	copy tasks
	        	to '/tmp/tasks.csv'
	        	delimiter ','
	        	csv header;
	        	return null;
	        end;
	        $$;

	        create trigger tasks_trigger
	        after insert or delete or update
	        on tasks
	        for each statement 
	        execute procedure tasks_export();

	        create or replace function progress_export()
	        	returns trigger 
	        	language plpgsql
	        	as 
	        $$
	        begin
	        	copy progress
	        	to '/tmp/progress.csv'
	        	delimiter ','
	        	csv header;
	        	return null;
	        end;
	        $$;

	        create trigger progress_trigger
	        after insert or delete or update
	        on progress
	        for each statement 
	        execute procedure progress_export();

	        create or replace function diary_export()
	        	returns trigger 
	        	language plpgsql
	        	as 
	        $$
	        begin
	        	copy diary
	        	to '/tmp/diary.csv'
	        	delimiter ','
	        	csv header;
	        	return null;
	        end;
	        $$;

	        create trigger diary_trigger
	        after insert or delete or update
	        on diary
	        for each statement 
	        execute procedure diary_export();
            """
        )
    ]
