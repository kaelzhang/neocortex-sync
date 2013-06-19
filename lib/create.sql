CREATE TABLE CM_cortexDependencies
(
Package varchar(50) not null,
Version varchar(20) not null,
Dependencies text,
Pending text,
primary key (Package,Version)
);