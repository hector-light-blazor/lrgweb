<script>
    import Header from "../components/Header.svelte";
    import Footer from "../components/Footer.svelte";
    import Wrapper from "../components/Wrapper.svelte";
    import PhotoCard from "../components/PhotoCard.svelte";
</script>
<style>
    h2{
        color: #D34628;
        font-size: 30px;
        font-weight: bold;
        margin: 3px 0 10px;
    }

    .titleCenter{
        text-align: center;
    }

    .grid-boss{
        display: flex;
        flex-direction: row;
        justify-content: center;
        height: 600px;
    }

    .grid-management{
        display: flex;
        height: 540px;
        flex-direction: row;
        justify-content: space-between;
    }

    .pics-manage{
        height: auto !important;
        padding-top: 3%;
        padding-bottom: 10%;
    }
    .grid-staff{
        display:flex;
        flex-direction:row;
        justify-content: space-between;
        align-items:center;
    }


     @media screen and (max-width: 1024px) {
       .grid-management{
            display: grid;
           
            margin-bottom: 130px;
            align-items: center;
            justify-content: space-evenly;
            max-height: 100%;
            height: 100vh;
      }


       .grid-staff{
               display: grid;
            flex-direction: column;
            align-items: center;
            justify-content: space-evenly;
            
       }
    }

</style>
<Header />
<Wrapper>
    <div class="pics-manage">
         <h2 class="titleCenter">Lower Rio Grande Development Council Emergency Communications 9-1-1 Contact List</h2>
        <div class="grid-boss">
            <PhotoCard office="(956) 682-3481 Ext. 176" name="Manuel Cruz" email="mcruz@lrgvdc911.org" cardHeight="500" cardWidth="350" photo="./build/assets/staff/mcruz.jpg" title="Director of Public Safety" />
        </div>
        
        <h2 class="titleCenter">Lower Rio Grande Management Team</h2>

        <div class="grid-management">
            <PhotoCard office="(956) 682-3481 Ext. 154" name="Raul Madero" email="rmadero@lrgvdc911.org"  cardHeight="500" 
            cardWidth="350" photo="./build/assets/staff/rmadero.jpg" title="Program Supervisor II" />
            <PhotoCard office="(956) 682-3481 Ext. 162" name="Maggie Garza" email="mgarza@lrgvdc911.org" cardHeight="500" cardWidth="350" 
            photo="./build/assets/staff/mgarza.jpg" title="Program Supervisor II" />
            <PhotoCard office="(956) 682-3481 Ext. 144" name="Jose A. Garcia" email="jgarcia@lrgvdc911.org"  cardHeight="500" cardWidth="350"
             photo="./build/assets/staff/jgarcia.jpg" title="Program Supervisor II" />
        </div>

        <h2 class="titleCenter">Lower Rio Grande 9-1-1 Staff</h2>
        <div class="grid-staff">
             <PhotoCard office="(956) 682-3481 Ext. 174" name="Maribel Alonzo" email="malonzo@lrgvdc911.org"  cardHeight="500" 
            cardWidth="350" photo="./build/assets/staff/malonzo.jpg" title="Customer Service II" />
            <PhotoCard office="(956) 682-3481 Ext. 175" name="Savannah Arredondo" email="sarredondo@lrgvdc911.org" cardHeight="500" cardWidth="350" 
            photo="./build/assets/staff/sarredondo.jpg" title="Customer Service II" />
            <PhotoCard office="(956) 682-3481 Ext. 143" name="Hector Chapa" email="hchapa@lrgvdc911.org"  cardHeight="500" cardWidth="350"
             photo="./build/assets/staff/hchapa.jpg" title="Program Specialist I" />
        </div>
        <div class="grid-staff">
               <PhotoCard office="(956) 682-3481 Ext. 139" name="Rosemary Contreras" email="rcontreras@lrgvdc911.org"  cardHeight="500" cardWidth="350"
             photo="./build/assets/staff/rcontreras.jpg" title="Customer Service IV" />

              <PhotoCard office="(956) 682-3481 Ext. 135" name="Alfredo Garcia" email="agarcia@lrgvdc911.org"  cardHeight="500" cardWidth="350"
             photo="./build/assets/staff/agarcia.jpg" title="Program Supervisor II" />

              <PhotoCard office="(956) 682-3481 Ext. 137" name="Daniel Gutierrez" email="dgutierrez@lrgvdc911.org"  cardHeight="500" cardWidth="350"
             photo="./build/assets/staff/jgutierrez.jpg" title="Customer Service II" />

        </div>

        <div class="grid-staff">
                <PhotoCard office="(956) 682-3481 Ext. 187" name="Jose L. Hernandez" email="jhernandez@lrgvdc911.org"  cardHeight="500" cardWidth="350"
             photo="./build/assets/staff/lhernandez.jpg" title="Program Specialist I" />

              <PhotoCard office="(956) 682-3481 Ext. 150" name="Ariana Morales" email="amorales@lrgvdc911.org"  cardHeight="500" cardWidth="350"
             photo="./build/assets/staff/amorales.jpg" title="Program Specialist I" />

              <PhotoCard office="(956) 682-3481 Ext. 124" name="Dennis Moreno" email="dmoreno@lrgvdc911.org"  cardHeight="500" cardWidth="350"
             photo="./build/assets/staff/dmoreno.jpg" title="Program Specialist I" />
        
        </div>
        <div class="grid-staff">
              <PhotoCard office="(956) 682-3481 Ext. 169" name="Juan Torres" email="jtorres@lrgvdc911.org"  cardHeight="500" cardWidth="350"
             photo="./build/assets/staff/jtorres.jpg" title="Program Specialist I" />
              <PhotoCard office="(956) 682-3481 Ext. 155" name="Leonel Valdez" email="lvaldez@lrgvdc911.org"  cardHeight="500" cardWidth="350"
             photo="./build/assets/staff/lvaldez.jpg" title="Customer Service II" />
              <PhotoCard office="(956) 682-3481 Ext. 136" name="Selenne I Vallejo" email="svallejo@lrgvdc911.org"  cardHeight="500" cardWidth="350"
             photo="./build/assets/staff/svallejo.jpg" title="Program Specialist I" />
        
        </div>
    </div>

</Wrapper>
<Footer />