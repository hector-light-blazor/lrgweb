<script>
    import {onMount} from "svelte";

    export let cardHeight= 280;
    export let cardWidth = 430;
    export let circleSize = 80;
    export let circleBackColor="#2B4988";
    export let circleTextColor="#fff";
    export let circleValue = 0;
    export let timerAnimation = 40;
    export let incrementValue = 5;
    export let title;
    export let p = [];
    export let option = -1;
    export let linkOn = false;
    let statusNumber = 0;
    let interval;
     let overAllYears = "https://gis.lrgvdc911.org/php/spartan/api/v2/index.php/addressticket/overAllYears/";
     let currentMonth = "https://gis.lrgvdc911.org/php/spartan/api/v2/index.php/addressticket/currentMonth/";
     let openTickets = "https://gis.lrgvdc911.org/php/spartan/api/v2/index.php/addressticket/openTickets/";
    

  
    onMount(async () => {
      
      //Option 1 to download all tickets over the years..
      if(option == 1){

          let response = await fetch(overAllYears);
          let data = await response.json()
          if(data){
             circleValue = parseInt(data['total']);
          }
      }else if(option == 2){
            let response = await fetch(currentMonth);
          let data = await response.json()
          if(data){
             circleValue = parseInt(data['total']);
          }

      }
      else if(option == 3){
          let response = await fetch(openTickets);
           let data = await response.json()
          if(data){
             circleValue = parseInt(data['total']);
          }

      }

      
      interval = setInterval(() => {
        if(circleValue > statusNumber) {
              statusNumber += incrementValue;
          }else{// when they are the same number
              statusNumber = circleValue;
              clearInterval(interval);
          }
      }, timerAnimation);
    });
</script>
<style>
    .flex-con{
        display: flex;
        flex-direction: column;
        align-items: center;
        align-content:space-around;
    }

   
    #card {
        border: 1px solid rgb(222, 222, 222);
       
        
    }
    #round {
        position: relative;
        top:0;
        left: 50%;
        border-radius: 50%;
        border: 1px solid rgb(222, 222, 222);
        text-align: center;
        display: flex;
        overflow: hidden;
        align-items: center;
        justify-content: center;
    }
    h2{
        
        text-align: center;
    }

    h3::after{
        content: '';
    width: 30%;
    margin: 15px auto 0;
    display: block;
    border-bottom: 1px solid #dedede;
    }
   
    button{
        background: #D34628;
        color: #fff;
        width: 120px;
        height: 40px;
        border: 1px solid #243C6B;
    }
    button:hover{
        background: rgba(245, 86, 50, 0.774);
        cursor: pointer;
    }
</style>




<div id="card" style="height: {cardHeight}px; width: {cardWidth}px;">
    <div id="round" 
    style="background-color: {circleBackColor};
    height: {circleSize}px; width: {circleSize}px; 
    margin-top:-{(circleSize/2)}px; margin-left: -{(circleSize/2)}px;">
        <h2 style="color: {circleTextColor}">{statusNumber}</h2>
    </div>
    <div class="flex-con">
        <div>
            <h3>{title}</h3>
        </div>
        <div>
            {#each p as para}
                <p>{para}</p>
           {/each}
        </div>
        {#if linkOn}
            <div >
                <button on:click="{()=>{window.app.navigate('/OpenTickets')}}">
                    Link
                </button>
            </div>
        {/if}
        
        
    </div>


</div>