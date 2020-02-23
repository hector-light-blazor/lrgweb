<style>
		.wrapper{
			margin: 0 auto;
			max-width: 1400px;
			background: white;
		}

			@media only screen and (max-width: 600px) {
			.wrapper{
				max-width: 550px;
			}
		}

		@media only screen and (max-width: 400px) {
			.wrapper{
				max-width: 350px;
			}
		}
	

</style>
<div class="wrapper">
    <slot></slot>
</div>