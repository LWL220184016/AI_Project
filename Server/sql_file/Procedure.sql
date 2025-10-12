DELIMITER //

CREATE PROCEDURE Find_E_food ()
    BEGIN
        SELECT * FROM ingredient WHERE ingredientName LIKE 'E%' ORDER BY quantity DESC;
    END //

DELIMITER ;

CALL Find_E_food();