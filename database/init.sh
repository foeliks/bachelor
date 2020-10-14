#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    drop table if exists users, categories, knowledge, tasks, progress, diary;   

    create table if not exists users (
    	user_id serial,
    	email text not null unique,
    	password text not null,
    	primary key (user_id)
    );

    create table if not exists categories (
    	category_id serial,
    	title text not null,
    	description text not null,
    	primary key (category_id)
    );

    create table if not exists knowledge (
    	knowledge_id serial,
    	category_id integer references categories (category_id),
    	description text not null,
    	optional bool default false,
    	primary key (knowledge_id)
    );

    create table if not exists tasks (
    	task_id serial,
    	category_id integer references categories (category_id),
    	knowledge_id integer references knowledge (knowledge_id),
    	description text not null,
    	optional bool default false,
    	correct_solution text,
		multiple_choice bool default false,
    	primary key (task_id)
    );

    create table if not exists progress (
    	user_id integer references users (user_id),
    	task_id integer references tasks (task_id),
    	solved bool,
    	num_tries integer,
    	user_solution text,
    	primary key (user_id, task_id, num_tries)
    );

    create table if not exists diary (
    	user_id integer references users (user_id),
    	knowledge_id integer references knowledge (knowledge_id),
    	primary key (knowledge_id, user_id)
    );
EOSQL
