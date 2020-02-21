

<style>
/* Style The Dropdown Button */
.menubtn {
  background-color: #000000;
  color: white;
  padding: 16px;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

/* The container <div> - needed to position the dropdown content */
.menudown {
  position: relative;
  display: inline-block;
}

/* Dropdown Content (Hidden by Default) */
.menudown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

/* Links inside the dropdown */
.menudown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

/* Change color of dropdown links on hover */
.menudown-content a:hover {background-color: #f1f1f1}

/* Show the dropdown menu on hover */
.menudown:hover .menudown-content {
  display: block;
}

/* Change the background color of the dropdown button when the dropdown content is shown */
.menudown:hover .menubtn {
  background-color: #000000;
}


  </style>


  <button class="menubtn">HOME</button>

  <button class="menubtn">PUBLIC EDUCATION</button>

<div class="menudown">
  <button class="menubtn">SERVICES</button>
  <div class="menudown-content">
    <a href="#">Link 1</a>
    <a href="#">Link 2</a>
    
  </div>
</div> 

<div class="menudown">
  <button class="menubtn">TRAININGS</button>
  <div class="menudown-content">
    <a href="#">Link 1</a>
    <a href="#">Link 2</a>
  </div>
</div> 

  <button class="menubtn">ABOUT US</button>

  <button class="menubtn">CONTACT</button>
  