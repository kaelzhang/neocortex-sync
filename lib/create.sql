-- create CM_cortexDependencies
CREATE TABLE CM_cortexDependencies
(
Package varchar(50) not null,
Version varchar(20) not null,
Dependencies text,
primary key (Package,Version)
);


-- create CM_cortexPendingDependencies
CREATE TABLE CM_cortexPendingDependencies
(
Id int NOT NULL AUTO_INCREMENT,
Package varchar(50) not null, -- 
Version varchar(20) not null,
PackageAffected varchar(50) not null,
VersionAffected varchar(20) not null,
primary key (Id)
);