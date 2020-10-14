#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    
	drop table if exists users, categories, knowledge, tasks, progress, diary;   

	-- CREATE TABLES

    create table users (
    	user_id serial,
    	email text not null unique,
    	password text not null,
    	primary key (user_id)
    );

    create table categories (
    	category_id serial,
    	title text not null,
    	description text not null,
    	primary key (category_id)
    );

    create table knowledge (
    	knowledge_id serial,
    	category_id integer references categories (category_id),
    	description text not null,
    	optional bool default false,
    	primary key (knowledge_id)
    );

    create table tasks (
    	task_id serial,
    	category_id integer references categories (category_id),
    	knowledge_id integer references knowledge (knowledge_id),
    	description text not null,
    	optional bool default false,
    	solution text,
		multiple_choice bool default false,
    	primary key (task_id)
    );

    create table progress (
    	user_id integer references users (user_id),
    	task_id integer references tasks (task_id),
    	solved bool,
    	num_tries integer,
    	user_solution text,
    	primary key (user_id, task_id, num_tries)
    );

    create table diary (
    	user_id integer references users (user_id),
    	knowledge_id integer references knowledge (knowledge_id),
    	primary key (knowledge_id, user_id)
    );



	-- IMPORT DATA FROM CSV 

	do
	\$\$
	begin
		copy users
		from '/tmp/users.csv'
		delimiter ','
		csv header;	
	
		exception
			when undefined_file then
				raise notice '/tmp/users.csv was not found.';
	end;
	\$\$
	language plpgsql;

	do
	\$\$
	begin
		copy categories
		from '/tmp/categories.csv'
		delimiter ','
		csv header;

		exception
			when undefined_file then
				raise notice '/tmp/categories.csv was not found.';
	end;
	\$\$
	language plpgsql;

	do
	\$\$
	begin
		copy knowledge
		from '/tmp/knowledge.csv'
		delimiter ','
		csv header;

		exception
			when undefined_file then
				raise notice '/tmp/knowledge.csv was not found.';
	end;
	\$\$
	language plpgsql;

	do
	\$\$
	begin
		copy tasks
		from '/tmp/tasks.csv'
		delimiter ','
		csv header;

		exception
			when undefined_file then
				raise notice '/tmp/tasks.csv was not found.';
	end;
	\$\$
	language plpgsql;

	do
	\$\$
	begin
		copy progress
		from '/tmp/progress.csv'
		delimiter ','
		csv header;

		exception
			when undefined_file then
				raise notice '/tmp/progress.csv was not found.';
	end;
	\$\$
	language plpgsql;

	do
	\$\$
	begin
		copy diary
		from '/tmp/diary.csv'
		delimiter ','
		csv header;

		exception
			when undefined_file then
				raise notice '/tmp/diary.csv was not found.';
	end;
	\$\$
	language plpgsql;



	-- CREATE TRIGGER FOR EXPORT DATA INTO CSV 

	drop trigger if exists users_trigger on users;
	drop trigger if exists categories_trigger on categories;
	drop trigger if exists knowledge_trigger on knowledge;
	drop trigger if exists tasks_trigger on tasks;
	drop trigger if exists progress_trigger on progress; 
	drop trigger if exists diary_trigger on diary;

	create or replace function users_export()
		returns trigger 
		language plpgsql
		as 
	\$\$
	begin
		copy users 
		to '/tmp/users.csv'
		delimiter ','
		csv header;
		return null;
	end;
	\$\$;

	create trigger users_trigger
	after insert or delete or update
	on users 
	for each statement 
	execute procedure users_export();

	create or replace function categories_export()
		returns trigger 
		language plpgsql
		as 
	\$\$
	begin
		copy categories
		to '/tmp/categories.csv'
		delimiter ','
		csv header;
		return null;
	end;
	\$\$;

	create trigger categories_trigger
	after insert or delete or update
	on categories
	for each statement 
	execute procedure categories_export();

	create or replace function knowledge_export()
		returns trigger 
		language plpgsql
		as 
	\$\$
	begin
		copy knowledge
		to '/tmp/knowledge.csv'
		delimiter ','
		csv header;
		return null;
	end;
	\$\$;

	create trigger knowledge_trigger
	after insert or delete or update
	on knowledge
	for each statement 
	execute procedure knowledge_export();

	create or replace function tasks_export()
		returns trigger 
		language plpgsql
		as 
	\$\$
	begin
		copy tasks
		to '/tmp/tasks.csv'
		delimiter ','
		csv header;
		return null;
	end;
	\$\$;

	create trigger tasks_trigger
	after insert or delete or update
	on tasks
	for each statement 
	execute procedure tasks_export();

	create or replace function progress_export()
		returns trigger 
		language plpgsql
		as 
	\$\$
	begin
		copy progress
		to '/tmp/progress.csv'
		delimiter ','
		csv header;
		return null;
	end;
	\$\$;

	create trigger progress_trigger
	after insert or delete or update
	on progress
	for each statement 
	execute procedure progress_export();

	create or replace function diary_export()
		returns trigger 
		language plpgsql
		as 
	\$\$
	begin
		copy diary
		to '/tmp/diary.csv'
		delimiter ','
		csv header;
		return null;
	end;
	\$\$;

	create trigger diary_trigger
	after insert or delete or update
	on diary
	for each statement 
	execute procedure diary_export();


EOSQL
