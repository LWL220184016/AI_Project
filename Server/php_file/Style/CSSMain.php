<?php header("Content-type: text/css"); ?>
body {
    margin: 0px;
    font-family: Georgia;
  }

  #flex-container {
    display: flex;
    flex-direction: row;
  }
  
  #header, #nav, #main, #aside, #footer {
    border: 1px solid black;
    margin: 5px;
    padding: 15px;
    box-shadow: 5px 5px 5px #888888;
  }
  
  #header {
    order: 1;
    height: auto;
    display: flex;
    background-color: #4CAF50;
    color: white;
  }
  
  #header button:hover {
    background-color: black;
  }
  
  nav {
    display: flex;
    flex-direction: column;
    padding: 10px;
  }

  .nav-button-container {
    display: inline-block;
  }

  .nav-button {
    display: block;
    background-color: Purple;
    color: white;
    padding: 8px 16px;
    text-align: center;
    text-decoration: none;
    font-size: 16px;
    border-radius: 5px;
    margin-bottom: 10px; /* Add some margin between the buttons */
  }
  
  .nav-button:first-child {
    margin-left: 0;
  }

  .nav-button:hover {
    background-color: #4CAF50;
  }

  #main table {
    border-collapse: collapse;
    width: 100%;
  }

  #main th, #main td {
    text-align: left;
    padding: 8px;
  }
  
  #main tr:nth-child(even){background-color: #f2f2f2}
  
  #main th {
    background-color: #4CAF50;
    color: white;
  }
  
  #footer {
    order: 5;
    width: 100%;
  }
  
  #header h1 ,#main h2 {
    width: auto;
  }

  #main h2{
    margin: 5px 0;
  }
  
  #header button {
    width: 100px;
  }
  
  #nav img {
    display: block;
    margin-bottom: 15px;
  }
  
  #nav button, #header button {
      background-color: purple;
      color: white;
      padding: 10px;
      margin-top: 20px;
      border: none;
      cursor: pointer;
      height: 50px;
  }
  
  #main h2 {
    margin: 0px 0px 3px 0px; 
  }
  
  #aside img { 
    float: right;
  }
  
  #aside div {
    clear: none;
  }
  
  @media only screen and (max-width: 900px){
  }
  
  @media only screen and (max-width: 750px){
  }
  