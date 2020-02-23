<script>
    export let src;

</script>
<style>
    video{
        max-width: 100%;
    }
    .btn-close{
        position: absolute;
        z-index: 2;
    }
    button{
        background: #2D2D61;
        color: white;
        cursor: pointer;
        border:0;
    }
    button:hover{
        background: rgb(55, 55, 122)
    }
</style>

<div class="btn-close">
    <button on:click>Go Back</button>
</div>
<video controls autoplay>
  <source {src} type="video/mp4">
  Your browser does not support HTML5 video.
</video>