-- create CM_cortexDependencies
CREATE TABLE CM_cortexDependencies
(
Package varchar(50) not null,
Version varchar(20) not null,
Dependencies text,
IsPending tinyint not null,
primary key (Package,Version)
);


-- create CM_cortexPendingDependencies
CREATE TABLE CM_cortexPendingDependencies
(
Id int NOT NULL AUTO_INCREMENT,
Package varchar(50) not null,
Version varchar(20) not null,
PendingPackage varchar(50) not null,
PendingVersion varchar(20) not null,
primary key (Id)
);