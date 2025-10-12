INSERT INTO comment (recipeID, userID, rating, comment) VALUES (1, 1, 3, "Tried this comment last night, and it turned out amazing! The chicken was so juicy and flavorful. Definitely adding this to my weekly rotation.");
INSERT INTO comment (recipeID, userID, rating, comment) VALUES (1, 2, 4, "This was a hit at my dinner party! Everyone wanted the comment. I did add a bit more garlic, but that's just personal preference.");
INSERT INTO comment (recipeID, userID, rating, comment) VALUES (1, 3, 2, "Great comment! Clear steps and easy to follow. I substituted beef for chicken, and it worked perfectly. Thanks for sharing!");
INSERT INTO comment (recipeID, userID, rating, comment) VALUES (1, 4, 4, "Loved this comment! It's so healthy and delicious. I swapped out the regular pasta for whole wheat pasta, and it was still fantastic.");
INSERT INTO comment (recipeID, userID, rating, comment) VALUES (1, 5, 5, "I had some trouble with the baking time—it took about 10 minutes longer in my oven. Other than that, it was perfect. My family devoured it.");
INSERT INTO comment (recipeID, userID, rating, comment) VALUES (2, 6, 1, "I made a few vegan modifications to this comment, and it still turned out great. Used tofu instead of chicken and loved it!");
INSERT INTO comment (recipeID, userID, rating, comment) VALUES (2, 7, 1, "Super quick and easy to make. Perfect for a busy weeknight dinner. I did add a bit more salt to suit my taste.");
INSERT INTO comment (recipeID, userID, rating, comment) VALUES (2, 8, 4, "Delicious! I added some extra chili flakes because I like it spicy. Will definitely make this again.");
INSERT INTO comment (recipeID, userID, rating, comment) VALUES (4, 9, 3, "I'm a really picky eater, but this comment was fantastic. Simple ingredients and amazing flavor.");
INSERT INTO comment (recipeID, userID, rating, comment) VALUES (4, 10, 1, "This comment is a keeper! I followed it to the letter, and it was perfect. Presentation was beautiful, too.");

UPDATE recipe SET rating = (SELECT SUM(rating) FROM comment WHERE recipeID = 1) WHERE recipeID = 1;
UPDATE recipe SET rating = (SELECT SUM(rating) FROM comment WHERE recipeID = 2) WHERE recipeID = 2;
UPDATE recipe SET rating = (SELECT SUM(rating) FROM comment WHERE recipeID = 4) WHERE recipeID = 4;