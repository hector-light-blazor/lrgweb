<script>
    import Carousel from "../components/Carousel.svelte";
    import RoundCard from "../components/RoundCard.svelte";
</script>
<style>
    .flex{
        height: 420px;
        display: flex;
        flex-direction: row;
        justify-items: center;
        text-align: center;
        margin:0 auto;
        padding: 35px;
    }
    .flex-main{
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        
    }
</style>
<div>
    <div class="flex-main">
        <Carousel />

        <div class="flex">
            <RoundCard />
            <RoundCard />
            <RoundCard />
        </div>
    
    </div>
    

</div>
