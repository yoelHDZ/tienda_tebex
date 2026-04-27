'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';

const BasketContext = createContext();

export function BasketProvider({ children }) {
    const [basket, setBasket] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, loading: userLoading, login, logout } = useUser();
    const hasValidatedBasket = useRef(false);

    useEffect(() => {
        const basketData = Cookies.get('basket');
        if (basketData && basketData !== 'undefined') {
            setBasket(JSON.parse(basketData));
        }
        setLoading(false);
    }, []);

    const updateBasket = (newBasket) => {
        setBasket(newBasket);
        Cookies.set('basket', JSON.stringify(newBasket), { expires: 14 });
    };

    const clearBasket = () => {
        setBasket(null);
        Cookies.remove('basket');
    };

    useEffect(() => {
        if (loading || userLoading || hasValidatedBasket.current) {
            return;
        }

        hasValidatedBasket.current = true;

        const validateBasket = async () => {
            const username = String(user?.name || '').trim();
            const basketIdent = basket?.data?.ident;
            console.log('Basket on page load', basket);

            if (!username) {
                if (basketIdent) {
                    clearBasket();
                }
                return;
            }

            try {
                const response = await fetch('/api/basket/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        basketIdent,
                        username,
                        origin: window.location.origin
                    })
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to validate basket');
                }

                if (data.requiresLogout) {
                    clearBasket();
                    logout();
                    return;
                }

                if (data.relogin) {
                    Cookies.set('user', JSON.stringify(user));
                    login(user);
                }

                if (data.basket?.data?.ident) {
                    Cookies.set('basket', JSON.stringify(data.basket), { expires: 14 });
                    updateBasket(data.basket);
                    return;
                }

                clearBasket();
            } catch {
                clearBasket();
            }
        };

        validateBasket();
    }, [basket?.data?.ident, loading, login, logout, user, user?.name, userLoading]);

    const refreshBasket = async (basketIdent) => {
        const response = await fetch('/api/fetchBasket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ basketIdent })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch basket');
        }
        updateBasket(data.basket);
        return data;
    };

    const addToBasket = async (basketIdent, package_id, quantity, options = {}) => {
        const user = Cookies.get('user');
        const parsedUser = user ? JSON.parse(user) : null;
        try {
            const response = await fetch('/api/addToBasket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    basketIdent,
                    package_id,
                    quantity,
                    categoryId: options?.categoryId,
                    giftCardEmail: options?.giftCardEmail,
                    targetUsername: options?.targetUsername,
                    discordId: parsedUser?.discordId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.message || 'Failed to add to basket');
                if (data.requiresGiftCardEmail) {
                    error.requiresGiftCardEmail = true;
                }
                throw error;
            }

            if (data.basket?.data?.ident) {
                updateBasket(data.basket);
            }

            return data;
        } catch (error) {
            throw error;
        }
    };

    const updateQuantity = async (basketIdent, package_id, quantity) => {
        try {
            const response = await fetch('/api/updateQuantity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    basketIdent,
                    package_id,
                    quantity
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update quantity');
            }
            updateBasket(data.basket);
            return data;
        } catch (error) {
            throw error;
        }
    };
    const removeFromBasket = async (basketIdent, package_id) => {
        try {
            const response = await fetch('/api/removeFromBasket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    basketIdent,
                    package_id
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to remove from basket');
            }
            updateBasket(data.basket);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const applyCoupon = async (basketIdent, coupon_code) => {
        const response = await fetch('/api/coupons/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ basketIdent, coupon_code })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to apply coupon');
        }
        return await refreshBasket(basketIdent);
    };

    const removeCoupon = async (basketIdent) => {
        const response = await fetch('/api/coupons/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ basketIdent })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || 'Failed to remove coupon');
        }
        return await refreshBasket(basketIdent);
    };

    const applyGiftCard = async (basketIdent, card_number) => {
        const response = await fetch('/api/giftcards/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ basketIdent, card_number })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to apply gift card');
        }
        return await refreshBasket(basketIdent);
    };

    const removeGiftCard = async (basketIdent, card_number) => {
        const response = await fetch('/api/giftcards/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ basketIdent, card_number })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || 'Failed to remove gift card');
        }
        return await refreshBasket(basketIdent);
    };

    const applyCreatorCode = async (basketIdent, creator_code) => {
        const response = await fetch('/api/creator-codes/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ basketIdent, creator_code })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to apply creator code');
        }
        return await refreshBasket(basketIdent);
    };

    const removeCreatorCode = async (basketIdent) => {
        const response = await fetch('/api/creator-codes/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ basketIdent })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || 'Failed to remove creator code');
        }
        return await refreshBasket(basketIdent);
    };

    const changeBasketCurrency = async (basketIdent, currency) => {
        const response = await fetch('/api/basket/currency', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ basketIdent, currency })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || 'Failed to change currency');
        }
        return await refreshBasket(basketIdent);
    };

    return (
        <BasketContext.Provider value={{ basket, loading, updateBasket, clearBasket, addToBasket, updateQuantity, removeFromBasket, applyCoupon, removeCoupon, applyGiftCard, removeGiftCard, applyCreatorCode, removeCreatorCode, changeBasketCurrency, refreshBasket }}>
            {children}
        </BasketContext.Provider>
    );
}

export function useBasket() {
    const context = useContext(BasketContext);
    if (context === undefined) {
        throw new Error('useBasket must be used within a BasketProvider');
    }
    return context;
} 