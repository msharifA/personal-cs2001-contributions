import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button
} from '@mui/material';
import axios from 'axios';

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/reports', {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            setReports(response.data);
        } catch (err) {
            console.error('Failed to load reports:', err);
            setError('Failed to load reports.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReport = async (reportId) => {
        try {
            await axios.delete(`http://localhost:8080/api/reports/${reportId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            fetchReports();
        } catch (err) {
            console.error('Failed to delete report:', err);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                User Reports
            </Typography>
            {reports.length === 0 ? (
                <Typography>No reports found.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Report ID</TableCell>
                                <TableCell>Reporter</TableCell>
                                <TableCell>Reported</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reports.map((report, index) => (
                                <TableRow key={report.id ?? `${index}-${report.reportedId}`}>
                                    <TableCell>{report.id}</TableCell>
                                    <TableCell>{report.reporterName || report.reporterId}</TableCell>
                                    <TableCell>{report.reportedName || report.reportedId}</TableCell>
                                    <TableCell>{report.title}</TableCell>
                                    <TableCell>{report.reason}</TableCell>
                                    <TableCell>{report.category}</TableCell>
                                    <TableCell>{report.status}</TableCell>
                                    <TableCell>{new Date(report.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>
                                        {report.status === 'PENDING' && (
                                            <Button 
                                                variant="contained" 
                                                color="error" 
                                                onClick={() => handleDeleteReport(report.id)}
                                            >
                                                Delete Report
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default AdminReports;