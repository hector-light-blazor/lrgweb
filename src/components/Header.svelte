

<head>
<meta name="viewport" content="width=device-width, initial-scale=1">






 <style> 
    #header{
        background-color: #d0d3d9;
        width: 100%;
        height: 15%;
           }
    #sub {
        background-color: #ffffff;
        width: 100%;
        height: 10%;
           }

body {
  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif
}

.navbar {
  overflow: hidden;
  height: 6%;
  padding-left: 20%;
  padding-top: 2%;
  font-weight: 500;
  padding-bottom: 7px;
  background-color: #073392 ;
}

.navbar a {
  float: left;
  font-size: 20px;
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
}

.dropdown {
  float: left;
  overflow: hidden;
}

.dropdown .dropbtn {
  font-size: 20px; 
  border: none;
  outline: none;
  color: white;
  padding: 14px 16px;
  background-color: inherit;
  font-family: inherit;
  margin: 0;
}

.navbar a:hover, .dropdown:hover .dropbtn {
  background-color: #4169e1;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.dropdown-content a {
  float: none;
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  text-align: left;
}

.dropdown-content a:hover {
  background-color: #ddd;
}

.dropdown:hover .dropdown-content {
  display: block;
}


</style>
</head>


<body>

<div class="navbar">
  <a href="#Home">HOME</a>
  <a href="PubEd">PUBLIC EDUCATION</a>


  <div class="dropdown"><button class="dropbtn">SERVICES </button>
  <div class="dropdown-content">
      <a href="Serv1">Link 1</a>
      <a href="Serv2">Link 2</a>
    </div>
  </div> 
    <div class="dropdown"><button class="dropbtn">TRAININGS </button>
  <div class="dropdown-content">
      <a href="Train1">Link 1</a>
      <a href="Train2">Link 2</a>
    </div>
  </div> 

  <a href="#AboutUs">ABOUT US</a>
  <a href="Contact">CONTACT</a>

</div>

</body>



<div id="header"></div>
<div id="sub"></div>




