###########################################################################
                    # for create PHP-FPM docker image #                    
                    ###################################
FROM php:8.2-fpm

#---------------------------------------------------------------
    # Install mysqli extension
# for conn.php(not use now)
# RUN docker-php-ext-install mysqli

# for conn2.php
RUN docker-php-ext-install pdo_mysql
#---------------------------------------------------------------

WORKDIR /php_file

 # 複製此路徑下的文件夾和其中的檔案到容器中進行隔離運行
#COPY ./html_file .

###########################################################################
