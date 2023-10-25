import { useState } from "react";
import { Link } from 'react-router-dom';

export default function Home() {
    const [lists, setLists] = useState([])
    const listUrl = new URL('lists/', 'http://localhost:8080')

    fetch(listUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",

    })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                setLists(data.lists)
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            console.log("server is down!!")
        });
    return (
        <ul>
            {
                lists.map(item =>
                    <li key={item}><Link to={`/lists/${item}`}>{item}</Link></li>
                )
            }
        </ul>
    )
}