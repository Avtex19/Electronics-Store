import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    IconButton,
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface ProductCardProps {
    product: {
        name: string;
        description: string;
        price: number;
        thumbnail: string;
        quantity: number;
        additional_images?: string[];
    };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const isAdmin = JSON.parse(localStorage.getItem('isAdmin') || 'false');

    const allImages = [product.thumbnail, ...(product.additional_images || [])];
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const mainImage = allImages[mainImageIndex];

    const [carouselIndex, setCarouselIndex] = useState(0);
    const visibleImagesCount = 4;

    useEffect(() => {
        if (mainImageIndex < carouselIndex) {
            setCarouselIndex(mainImageIndex);
        } else if (mainImageIndex >= carouselIndex + visibleImagesCount) {
            setCarouselIndex(mainImageIndex - visibleImagesCount + 1);
        }
    }, [mainImageIndex]);

    const handleNextImage = () => {
        setMainImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
    };

    const handlePrevImage = () => {
        setMainImageIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
    };

    return (
        <Grid container spacing={2} sx={{ maxWidth: 1200, margin: 'auto', padding: '20px' }}>
            <Grid item xs={12} sm={5} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {allImages.length > 1 && (
                        <IconButton
                            onClick={handlePrevImage}
                            sx={{ position: 'absolute', left: 0, zIndex: 1 }}
                        >
                            <ArrowBackIosIcon />
                        </IconButton>
                    )}

                    <Box
                        component="img"
                        src={mainImage}
                        alt={product.name}
                        sx={{
                            width: '100%',
                            maxWidth: 400,
                            height: 'auto',
                            borderRadius: '8px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                        }}
                    />

                    {allImages.length > 1 && (
                        <IconButton
                            onClick={handleNextImage}
                            sx={{ position: 'absolute', right: 0, zIndex: 1 }}
                        >
                            <ArrowForwardIosIcon />
                        </IconButton>
                    )}
                </Box>

                {allImages.length >= 1 && (
                    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', paddingY: 1, width: '100%', marginTop: 2 }}>
                        {allImages.slice(carouselIndex, carouselIndex + visibleImagesCount).map((image, index) => (
                            <Box
                                key={index}
                                component="img"
                                src={image}
                                alt={`Additional Image ${index + 1}`}
                                onClick={() => setMainImageIndex(carouselIndex + index)}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s',
                                    border: mainImageIndex === carouselIndex + index ? '2px solid orange' : 'none',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                    },
                                }}
                            />
                        ))}
                    </Box>
                )}
            </Grid>

            <Grid item xs={12} sm={7} md={8}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    {product.name}
                </Typography>

                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', marginBottom: '12px' }}>
                    ${product.price.toFixed(2)}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ marginBottom: '16px' }}>
                    {product.description}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 'bold',
                        color: product.quantity > 0 ? 'green' : 'red',
                        marginBottom: '20px',
                    }}
                >
                    {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </Typography>

                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{
                        paddingX: '24px',
                        paddingY: '10px',
                        borderRadius: '25px',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        marginRight: '10px',
                    }}
                >
                    Add to Cart
                </Button>

                {isAdmin && (
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="large"
                        sx={{
                            paddingX: '24px',
                            paddingY: '10px',
                            borderRadius: '25px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                        }}
                    >
                        Edit
                    </Button>
                )}
            </Grid>
        </Grid>
    );
};

export default ProductCard;