INSERT INTO weight_Unit (unitName) VALUES ("kilogram(kg)");
INSERT INTO weight_Unit (unitName, proportionToKG, operationToKG) VALUES ("gram(g)", 1000, "/");
INSERT INTO weight_Unit (unitName, proportionToKG, operationToKG) VALUES ("pound(lb)", 2.2046, "/");
INSERT INTO weight_Unit (unitName, proportionToKG, operationToKG) VALUES ("ounce(oz)", 35.274, "/");
INSERT INTO weight_Unit (unitName, proportionToKG, operationToKG) VALUES ("hundredweight(cwt)", 45.3592, "*");


-- 1.
-- To convert grams to kilograms, divide the weight in grams by 1000.
-- ```kilograms = grams / 1000```
-- For example, to convert 500 grams to kilograms:
-- ```kilograms = 500 grams / 1000, kilograms = 0.5 kilograms```

-- 2.
-- To convert pounds to kilograms, divide the weight in pounds by 2.2046.
-- ```kilograms = pounds / 2.2046```
-- For example, to convert 100 pounds to kilograms:
-- ```kilograms = 100 pounds / 2.2046, kilograms = 45.3592 kilograms```

-- 3.
-- To convert ounces to kilograms, divide the weight in ounces by 35.274.
-- ```kilograms = ounces / 35.274```
-- For example, to convert 16 ounces to kilograms:
-- ```kilograms = 16 ounces / 35.274, kilograms = 0.453592 kilograms```

-- 4.
-- To convert hundredweight to kilograms is:
-- ```kilograms = hundredweight * 45.3592```
-- For example, to convert 5 hundredweight to kilograms:
-- ```kilograms = 5 hundredweight * 45.3592, kilograms = 226.796 kilograms```

-- It is important to note that these formulas only apply to the conversion of weight. 
-- If you are converting mass, you will need to use different formulas.
