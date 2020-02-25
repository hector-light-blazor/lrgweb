<script>
    import Carousel from "../components/Carousel.svelte";
    import RoundCard from "../components/RoundCard.svelte";
    import Header from "../components/Header.svelte";
	import Footer from "../components/Footer.svelte";
    import Wrapper from "../components/Wrapper.svelte";
 
</script>
<style>
    .flex-main{
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        
    }
    #table{
        height: 390px;
        padding: 20px;
        border: 1px solid #ccc!important
    }

    .table {
    width: 100%;
    margin-bottom: 1rem;
    margin-top: 1rem;
}

.table {
    display: table;
}

.table thead, .table tfoot, .table .thead, .table .tfoot {
    border-bottom: 4px solid #e4e4e4;
}

.table.striped tbody tr:nth-child(odd),
.table.striped .tbody .tr:nth-child(odd) {
  background: #f8f8f8;
}
</style>
<Header />
<Wrapper>
    <div class="flex-main">
        <Carousel />
        <div id="table">
            <table class="table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Username</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>1</td>
                        <td>Bill</td>
                        <td>Gates</td>
                        <td>@billy</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>Steve</td>
                        <td>Jobs</td>
                        <td>@stevy</td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>Larry</td>
                        <td>Page</td>
                        <td>@larry</td>
                    </tr>
                    </tbody>
                </table>
        </div>
    </div>
</Wrapper>
<Footer />