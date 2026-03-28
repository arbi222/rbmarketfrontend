import { useEffect, useState } from 'react';
import "./sidebar.css";
import Dashboard from '../Dashboard/dashboard';
import Users from '../Users/users';
import Products from '../Products/products';
import Categories from '../Categories/categories';
import Brands from '../Brands/brands';
import Reviews from '../Reviews/reviews';
import { Link, useSearchParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import Orders from '../Orders/orders';
import Transactions from '../Transactions/transactions';

const Sidebar = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get("tab");

    const sidebarOptions = [
        {_id: 1, text: "Dashboard", component: <Dashboard />},
        {_id: 2, text: "Users", component: <Users tab={tab}/>},
        {_id: 3, text: "Products", component: <Products tab={tab}/>, addLink: "/list-item"},
        {_id: 4, text: "Reviews", component: <Reviews tab={tab}/>},
        {_id: 5, text: "Orders", component: <Orders tab={tab} />},
        {_id: 6, text: "Transactions", component: <Transactions tab={tab} />},
        {_id: 7, text: "Categories", component: <Categories />, addLink: "/brand-category?categoryPage=true"},
        {_id: 8, text: "Brands", component: <Brands />, addLink: "/brand-category?brandPage=true"},
    ]

    const [activeBtn, setActiveBtn] = useState(sidebarOptions[0]);

    useEffect(() => {
        if (!tab) return;
        const selected = sidebarOptions.find(option => option.text.toLowerCase() === tab.toLowerCase());

        if (selected){
            setActiveBtn(selected);
            searchParams.delete("tab");
            setSearchParams(searchParams);
        }
    }, [tab])

    return (
      <div className='sidebar-component'>
          <div className='sidebar-options'>
            <div className='scrolling-buttons'>
              {sidebarOptions.map(option => (
                  <button key={option._id} 
                        onClick={() => setActiveBtn(option)}
                        className={`${activeBtn._id === option._id ? 'active-sidebar-btn' : ""}`}>
                      {option.text}
                  </button>
              ))}
            </div>
          </div>

          <div className='option-inside'>
              <div className='option-inside-header'>
                <h1>{activeBtn.text}</h1>
                {activeBtn?.addLink &&
                    <Link className='btn add-item-btn' to={activeBtn.addLink} title='Add item'>
                        Add
                        <AddIcon style={{marginBottom: "2px"}}/>
                    </Link>
                }
              </div>

              <div className='option-inside-body'>
                {activeBtn.component}
              </div>
          </div>
      </div>  
    )
}

export default Sidebar;