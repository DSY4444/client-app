import { useState,useEffect } from "react";
import fetchRequest from "../../utils/fetchRequest";
import PageHeader from "../../components/pageHeader";
import MDBox from "../../components/MDBox"

// import PropTypes from 'prop-types'

const Home = () => {
    const [res,setRes]=useState("No Responsess")

    useEffect( () => {

        //   const domain = getDomain();
        async function fetchData(){

        const resp = await fetchRequest.get(`/api/app`);
        console.log(resp);
     
            setRes(resp[1])
        
    }

    fetchData();

    },[]);

    return(
       <MDBox>
        <PageHeader/>
       </MDBox>
    )

}

// index.propTypes = {}

export default Home
