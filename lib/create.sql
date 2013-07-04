-- create CM_cortexDependencies
CREATE TABLE CM_cortexDependencies
(
Id int NOT NULL AUTO_INCREMENT,
Name varchar(50) not null,
Version varchar(20) not null,
Dependencies text,
primary key (Id)
);


-- create CM_cortexPendingDependencies
CREATE TABLE CM_cortexPendingDependencies
(
Id int NOT NULL AUTO_INCREMENT,
Name varchar(50) not null, -- 
Version varchar(20) not null,
NameAffected varchar(50) not null,
VersionAffected varchar(20) not null,
primary key (Id)
);


CREATE TABLE CM_cortexCombo
(
Name varchar(50) not null,
Version varchar(20) not null,
ComboId int not null,
primary key(Name, Version)
);