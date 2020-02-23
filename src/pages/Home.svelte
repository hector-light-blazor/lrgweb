<script>
    import Carousel from "../components/Carousel.svelte";
    import RoundCard from "../components/RoundCard.svelte";
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
        padding: 40px;
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
    #innerComms{
        height: 100%;
        margin-top: 20px;
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

    .title{
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 30pt;
        text-align: center;
        line-height: 54px;
        padding: 15px;
        width: 240px;
        height: 160px;
        
        
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
<div>
    <div class="flex-main">
        <Carousel />
        
        <div class="ecoms">
            <!-- <div id="titleServe">We Serve</div> -->
            <div id="innerComms">
                
                <div class="title">
                    <span>2</span>
                    <span>Counties</span>
                </div>
                <div class="title">
                    <span>1</span>
                    <span>Million Served</span>
                </div>
                <div class="title">
                    <span>17</span>
                    <span>PSAPs</span>
                </div>
                <div class="title">
                    <span>20</span>
                    <span>Municipalities</span>
                </div>
            </div>
        </div>
        <div id="title">
            <h1>Address Request</h1>
            <h3>Summary Overview</h3>
            <div class="flex">
                <RoundCard p="Find out what services the Cameron County 911 Communication District provides to the citizens of Cameron County." title="Per Year" />
                <RoundCard 
                p="Find out what services the Cameron County 911 Communication District provides to the citizens of Cameron County."
                title="Per Month" />
                <RoundCard 
                p="Did you called for an 9-1-1 address? Tired of waiting? Well don't wait any longer. Find out if you're address is ready.  Click at the following link to get your address letter online!"
                title="Open Request" />
            </div>
        </div>
        
    
    </div>
    

</div>
