-- create CM_cortexDependencies
CREATE TABLE CM_cortexDependencies
(
Id int NOT NULL AUTO_INCREMENT,
Name varchar(50) NOT NULL,
Version varchar(20) NOT NULL,
Dependencies text,
PRIMARY KEY (Id)
);

CREATE INDEX Package ON CM_cortexDependencies(Name, Version); 


-- create CM_cortexPendingDependencies
CREATE TABLE CM_cortexPendingDependencies
(
Id int NOT NULL AUTO_INCREMENT,
Name varchar(50) NOT NULL, -- 
Version varchar(20) NOT NULL,
NameAffected varchar(50) NOT NULL,
VersionAffected varchar(20) NOT NULL,
PRIMARY KEY (Id)
);


CREATE TABLE CM_cortexCombo
(
Name varchar(50) NOT NULL,
Version varchar(20) NOT NULL,
ComboId int NOT NULL,
PRIMARY KEY (Name, Version)
);