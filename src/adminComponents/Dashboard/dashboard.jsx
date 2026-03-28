import { useEffect } from 'react';
import "./dashboard.css";
import StatCard from './StatCard/statCard';
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress } from '@mui/material';
import { getDashboardData, resetMessages } from '../../redux/features/adminSlice';
import { toast } from 'react-toastify';

const Dashboard = () => {

    const dispatch = useDispatch();
    const {dashboardData, error, isFetchingChecked, loading} = useSelector((state) => state.admin.users);

    useEffect(() => {
      dispatch(getDashboardData());
    }, []);

    useEffect(() => {
      if (error) toast.error(error);
      dispatch(resetMessages());
    }, [error]);

    if (!isFetchingChecked || loading) {
        return (
          <div className='loading-screen-admin'>
            <CircularProgress size={40} thickness={5} />
          </div>
        )
    }

    return (
      <div className='admin-dashboard'>
        <StatCard title="Users" value={dashboardData?.users} />
        <StatCard title="RB Market Revenue" value={(dashboardData?.revenue / 100).toFixed(2)} />
        <StatCard title="Products" value={dashboardData?.products} />
        <StatCard title="Reviews" value={dashboardData?.reviews} />
        <StatCard title="Orders" value={dashboardData?.orders} />
        <StatCard title="Transactions" value={dashboardData?.transactions} />
        <StatCard title="Categories" value={dashboardData?.categories} />
        <StatCard title="Brands" value={dashboardData?.brands} />
      </div>
    )
}

export default Dashboard;