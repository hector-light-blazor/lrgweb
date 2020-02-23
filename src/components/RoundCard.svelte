<script>
    import {onMount} from "svelte";

    export let cardHeight= 280;
    export let cardWidth = 430;
    export let circleSize = 80;
    export let circleBackColor="#2B4988";
    export let circleTextColor="#fff";
    export let circleValue = 100;
    export let timerAnimation = 40;
    export let title;
    export let p;

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
            <p>
                {p}
            </p>
        </div>
        <div >
            <button>
                Link
            </button>
        </div>
        
    </div>


</div>