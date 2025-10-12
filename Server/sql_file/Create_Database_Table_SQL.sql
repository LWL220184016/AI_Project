CREATE DATABASE IF NOT EXISTS mydb;
CREATE USER 'user1'@'%' IDENTIFIED BY 'user1pw';
GRANT ALL PRIVILEGES ON mydb.* TO 'user1'@'%';
FLUSH PRIVILEGES;

use mydb;

CREATE TABLE user(
    userID INT AUTO_INCREMENT,
    userName VARCHAR(100) NOT NULL UNIQUE,
    userPassword VARCHAR(100) NOT NULL,
    userEmail VARCHAR(254),
    avatar VARCHAR(254),
    accCreationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    country VARCHAR(60),
    PRIMARY KEY (userID)
);

    -- The following table design for 美食资讯
CREATE TABLE recipe(
    recipeID INT AUTO_INCREMENT,
    userID INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    type VARCHAR(100),
    description TEXT,
    cookTime INT,
    prepTime INT,
    difficultyLevel VARCHAR(20),
    servingSize INT,
    rating INT,
    releaseDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imageName VARCHAR(15),
    PRIMARY KEY (recipeID),
    FOREIGN KEY (userID) REFERENCES user(userID)
);

CREATE TABLE food(
    foodID INT AUTO_INCREMENT,
    foodName VARCHAR(100) NOT NULL UNIQUE,
    Carbohydrates DECIMAL(10,2),
    Proteins DECIMAL(10,2),
    Fats DECIMAL(10,2),
    Vitamins DECIMAL(10,2),
    Minerals DECIMAL(10,2),
    Water DECIMAL(10,2),
    PRIMARY KEY (foodID)
);

CREATE TABLE recipeIngredient(
    id INT AUTO_INCREMENT,
    recipeID INT,
    ingredientName TEXT,
    weight_KG DECIMAL(10,2),
    unitName VARCHAR(50),
    PRIMARY KEY (id),
    FOREIGN KEY (recipeID) REFERENCES recipe(recipeID)
);

CREATE TABLE recipeStep(
    recipeID INT,
    sequenceID INT,
    content TEXT,
    PRIMARY KEY (recipeID, sequenceID),
    FOREIGN KEY (recipeID) REFERENCES recipe(recipeID)
);

CREATE TABLE category(
    categoryID INT AUTO_INCREMENT,
    categoryName VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (categoryID)
);

CREATE TABLE comment(
    commentID INT AUTO_INCREMENT,
    recipeID INT,
    foodID INT,
    userID INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    rating INT CHECK (rating >= 0 AND rating <= 5),
    comment TEXT,
    createTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (commentID),
    FOREIGN KEY (recipeID) REFERENCES recipe(recipeID),
    FOREIGN KEY (userID) REFERENCES user(userID)
);

CREATE TABLE weight_Unit(
    id INT AUTO_INCREMENT,
    unitName VARCHAR(50) UNIQUE,
    proportionToKG INT,
    operationToKG VARCHAR(2),
    PRIMARY KEY (id)
);

CREATE TABLE draft(
    draftID INT AUTO_INCREMENT,
    userID INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    data JSON,
    createTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastUpdateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (draftID),
    FOREIGN KEY (userID) REFERENCES user(userID),
    INDEX (userID)
);