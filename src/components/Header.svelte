<script>

  console.log(window.app);
</script>

<style> 

.wrapper{
  
  height: 64px;
  background-color: #fff;
  border-bottom: 5px solid #ddd;
  border-top: 5px solid #D9B13B;

}
.navbar {
  display: flex;
  overflow: hidden;
  
  align-items: center;
  justify-content: center;
  font-weight: 520;
}



.btnnav{
  display: none;
}
.btnnav button{
  background: transparent;
  width: 40px;
  
}
img{
  max-width: 100%;
  width: 108px;
  z-index: 99999;
  
}

.logo{
  position: absolute;
  left: 34px;
  z-index: 4;
}

.navbar a {
  float: left;
  font-size: 20px;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  color: rgba(20, 57, 117, 1) !important;
}

.dropdown {
  float: left;
  overflow: hidden;
}

.dropdown .dropbtn {
  font-size: 20px; 
  font-weight: 500;
  border: none;
  outline: none;
  color: rgba(20, 57, 117, 1) !important;
  padding: 14px 16px;
  background-color: inherit;
  font-family: inherit;
  margin: 0;
  cursor: pointer;
}

.navbar a:hover, .dropdown:hover .dropbtn {
  background-color:#ddd;
  color: #fff;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #ddd;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 2;
  cursor: pointer;

}

.dropdown-content a {
  float: none;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  text-align: left;
}

.dropdown-content a:hover {
  background-color: white;
  cursor: pointer;
}

.dropdown:hover .dropdown-content {
  display: block;
  cursor: pointer;
}
@media only screen and (max-width: 1200px) {
  .logo{
    position: relative;
  }
  .wrapper {
    display: grid;
    grid-template-columns: 20% 80%;
  }

  .navbar {
      align-items: inherit;
      justify-content: space-around;
      font-weight: 200;
  }
}

@media only screen and (max-width: 1034px) {
     .wrapper {
      display: grid;
      grid-template-columns: 88% 12%;
    }

    .navbar{
      display: none;
    }

    .btnnav{
      display: flex;
      height: 64px;
      text-align: center;
      justify-content: center;
      align-items: center;
     
    }

    .btnnav > button:hover{
       cursor: pointer;
       color:rgba(20, 57, 117, 1);
       border: 1px solid rgba(20, 57, 117, 1);
    }
}






</style>



<div class="wrapper">
    <div class="logo">
        <img alt="logo"  src="/build/assets/logo/public_safety_logo.webp" />
    </div>
    <div class="btnnav">
      <button>
        <span class="mif-menu"></span>
      </button>
    </div>
    <div class="navbar">
  
          <a on:click|preventDefault="{()=>{window.app.navigate('/')}}" href="#Home">HOME</a>
          <a on:click|preventDefault="{()=>{window.app.navigate('/PubEd')}}" href="#PubEd">PUBLIC EDUCATION</a>


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

          <a on:click|preventDefault="{()=>{window.app.navigate('/AboutUs')}}" href="#AboutUs">ABOUT US</a>
          <a href="Contact">CONTACT</a>

    </div>

</div>






