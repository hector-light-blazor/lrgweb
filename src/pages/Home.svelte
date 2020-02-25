<script>
    import Carousel from "../components/Carousel.svelte";
    import RoundCard from "../components/RoundCard.svelte";
    import Header from "../components/Header.svelte";
	import Footer from "../components/Footer.svelte";
    import Wrapper from "../components/Wrapper.svelte";
 
</script>
<style>
    .flex{
        margin-top: 42px;
        height: 420px;
        display: flex;
        flex-direction: row;
        justify-items: center;
        text-align: center;
        margin:0 auto;
        padding: 70px;
    }
    .flex-main{
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        
    }
    .ecoms{
        
        background: rgba(20, 57, 117, 1);
        max-width: 100%;
        height: 290px;
        margin-bottom: 50px;
    }

    .ecoms2{
        
        background: #8a0303;
        max-width: 100%;
        height: 290px;
        margin-bottom: 50px;
    }

    

    #innerComms{
        height: 100%;
        margin-top: 65px;
        padding: 0;
        color: white;
        display: -webkit-box;
        display: -moz-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        align-items: center;
        justify-content: center;

    }
    #innerComms2{
        height: 100%;
        margin-top: -100px;
        padding: 0;
        color: white;
        display: -webkit-box;
        display: -moz-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
       
        justify-content: center;

    }

    .title{
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 25pt;
        text-align: center;
        line-height: 50px;
        padding: 75px;
        width: 300px;
        height: 250px;
                
    }

    .title2{
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 25pt;
        text-align: center;
        line-height: 50px;
        padding: 75px;
        width: 300px;
        height: 250px;
                
    }

    #titleServe{
        position: absolute;
        left: 50%;
        margin-left: -110px;
        width: 220px;
        z-index: 2;
        text-align: center;
        font-size: 2.4em;
        color: white;
        text-transform: uppercase; 
    }
    
    h1, h3 {
        color: #4c4343;
        text-align: center;
    }
    @media screen and (max-width: 880px) {
      .flex{
          display: flex;
          flex-direction: column;
          align-items: center;
          max-height: 100%;
          height: 100vh;
      }
      
    }
    
          
    

</style>

<Header   />
<Wrapper>
    <div>
    <div class="flex-main">
        <Carousel />
        
        <div class="ecoms">
            <!-- <div id="titleServe">We Serve</div> -->
            <div id="innerComms">
                
                
                <div class="title">
                    <span>2</span>
                    <span>COUNTIES</span>
                </div>
                <div class="title">
                    <span>25</span>
                    <span>MUNICIPALITIES</span>
                </div>
                <div class="title">
                    <span>17</span>
                    <span>PSAP</span>
                </div>
            </div>
        </div>
        
            <div id="title">
                <h1>Address Request</h1>
               
                <div class="flex">
                    <RoundCard incrementValue={111} option="1" p={[""]} title="Per Year" />
                    <RoundCard  option="2"
                    p={["Find out what services the Cameron County 911 Communication District provides to the citizens of Cameron County."]}
                    title="Per Month" />
                    <RoundCard  option="3"
                    linkOn={true} 
                    p={["Have you called to register for your 9-1-1 address? Click below to see if your address letter is ready!",]}
                    title="Open Request" />
                </div>


    <div class="ecoms2">
            <!-- <div id="titleServe">We Serve</div> -->
            <div id="innerComms2">
                
                
                <div class="title2">
                    <span>882,416</span>
                    <span>RESIDENTS SERVE</span>
                </div>
                <div class="title2">
                    <span>41,075</span>
                    <span>AVERAGE CALLS PER MONTH</span>
                </div>
                <div class="title2">
                    <span>1,369</span>
                    <span>AVERAGE CALLS PER DAY</span>
                </div>
                
            </div>
        </div>
                


            </div>
        </div>
    </div>
</Wrapper>
<Footer />
