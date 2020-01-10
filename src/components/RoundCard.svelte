<script>
    import {onMount} from "svelte";

    export let cardHeight;
    export let cardWidth;
    export let circleSize;
    export let circleBackColor;
    export let circleTextColor;
    export let circleValue = 0;
    export let timerAnimation = 25;

    let statusNumber = 0;
    let interval;

    onMount(async () => {
      interval = setInterval(() => {
          if(circleValue != statusNumber) {
              statusNumber += 5;
          }else{// when they are the same number
              statusNumber = circleValue;
              clearInterval(interval);
          }
      }, timerAnimation);
    });
</script>
<style>
    #card {
        border: 1px solid black;
        border-radius: 20px;
        box-shadow: 6px 6px 2px 1px rgba(0, 0, 0, .2);
    }
    #round {
        position: relative;
        top:0;
        left: 50%;
        border-radius: 50%;
        border: 1px solid black;
        text-align: center;
        display: flex;
        overflow: hidden;
        align-items: center;
        justify-content: center;
    }
    h2{
        
        text-align: center;
    }
</style>




<div id="card" style="height: {cardHeight}px; width: {cardWidth}px;">
    <div id="round" 
    style="background-color: {circleBackColor};
    height: {circleSize}px; width: {circleSize}px; 
    margin-top:-{(circleSize/2)}px; margin-left: -{(circleSize/2)}px;">
        <h2 style="color: {circleTextColor}">{statusNumber}</h2>
    </div>


</div>