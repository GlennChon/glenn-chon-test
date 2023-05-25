import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('');
    const [filterTerm, setFilterTerm] = useState('');
    const [hasNextPage, setHasNextPage] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        //error url
        //`https://world.asdfawefopenfoodfacts.org/cgi/asdf`;
        const apiUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=&page=${page}&json=true`;
        if (sortOption != '') {
            apiUrl += `&sort_by=${sortOption}`
        }
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                return response.json();
            })
            .then(data => {
                setProducts(data.products);
                setIsLoading(false);
                setHasNextPage(data.products.length > endIdx);
            })
            .catch(error => {
                setError(error.message);
                setIsLoading(false);
            });
    }, [page, sortOption]);

    useEffect(() => {
        // Fetch all products for filtering
        fetch('https://world.openfoodfacts.org/cgi/search.pl?search_terms=&page=1&json=true')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch products for filtering');
                }
                return response.json();
            })
            .then(data => {
                setProducts(data.products);
            })
            .catch(error => {
                setError(error.message);
            });
    }, []);

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const handleNextPage = () => {
        setPage(page + 1);
    };

    const handleSortChange = event => {
        setSortOption(event.target.value);
    };

    const handleFilterChange = event => {
        setFilterTerm(event.target.value);
    };

    // Checks name and ingredients
    const filteredProducts = products.filter(product =>
        (product.product_name && product.product_name.toLowerCase().includes(filterTerm.toLowerCase())) ||
        (product.ingredients_text && product.ingredients_text.toLowerCase().includes(filterTerm.toLowerCase()))
    );

    const productsPerPage = 10;
    const startIdx = (page - 1) * productsPerPage;
    const endIdx = startIdx + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIdx, endIdx);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography variant="h6" color="error">{error}</Typography>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
            <Typography variant="h4" gutterBottom>Product List</Typography>
            <div style={{ marginBottom: '1rem' }}>
                <TextField label="Filter" value={filterTerm} onChange={handleFilterChange} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="sort-select">Sort Order: </label>
                <select id="sort-select" value={sortOption} onChange={handleSortChange}>
                    <option value="">Nothing</option>
                    <option value="unique_scans_n">Unique Scans</option>
                    <option value="popularity_key">Popularity</option>
                    <option value="nutriscore_score">Nutriscore Score</option>
                    <option value="ecoscore_score">Ecoscore Score</option>
                </select>
            </div>
            <List style={{ width: '100%' }}>
                {paginatedProducts.map(product => (
                    <ListItem key={product.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <img src={product.image_front_url} alt={product.product_name} style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
                        </div>
                        <ListItemText
                            primaryTypographyProps={{ align: 'center' }}
                            secondaryTypographyProps={{ align: 'center' }}
                            primary={product.product_name}
                            secondary={product.ingredients_text}
                        />
                    </ListItem>
                ))}
            </List>
            <div style={{ marginTop: '1rem' }}>
                <Button variant="contained" onClick={handlePreviousPage} disabled={page === 1}>
                    Previous Page
                </Button>
                <Button variant="contained" onClick={handleNextPage} disabled={!hasNextPage}>
                    Next Page
                </Button>
            </div>
            {!hasNextPage && (
                <Typography variant="body2" style={{ marginTop: '1rem' }}>No more products available.</Typography>
            )}
        </div>
    );
};

export default ProductList;
