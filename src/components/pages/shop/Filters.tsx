'use client';

import { CATEGORIES, CLOTHING_SIZES, GENDERS } from '@util/global';

import shopStyles from '@styles/pages/shop.module.css';
import { useMenuShadowContext } from '@components/providers/MenuShadow';
import { useState } from 'react';



export interface UserFiltersType {
    categories: string[],
    sizes: string[],
    gender: string,
    minPrice: number,
    maxPrice: number,
    deleted: boolean
}

interface FiltersType {
    filters: UserFiltersType,
    setFilters: React.Dispatch<React.SetStateAction<UserFiltersType>>
}

export function Filters({ filters, setFilters }: FiltersType) {
    const msContext = useMenuShadowContext();
    const openPopUp = () => {
        msContext.setContent(<FilterPopUp filters={filters} setFilters={setFilters} />);
        msContext.openMenu();
    }
    return <button onClick={openPopUp}>Filters</button>;
}

export function FilterPopUp({ filters, setFilters }: FiltersType) {
    const [popUpFilters, setPopUpFilters] = useState<UserFiltersType>(filters);
    const msContext = useMenuShadowContext();

    const updateCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        setPopUpFilters(prevFilters => {
            const categories = prevFilters.categories;
            const newCategoriesArr = checked ? [...categories, value] : categories.filter(val => val !== value);
            return { ...prevFilters, categories: newCategoriesArr };
        });
    }

    const updateSizes = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        setPopUpFilters(prevFilters => {
            const sizes = prevFilters.sizes;
            const newSizesArr = checked ? [...sizes, value] : sizes.filter(val => val !== value);
            return { ...prevFilters, sizes: newSizesArr };
        });
    }

    const updateGender = (event: React.ChangeEvent<HTMLInputElement>) => {
        const gender = event.target.value;
        setPopUpFilters(prevFilters => {
            return { ...prevFilters, gender: gender };
        });
    }

    const updateMaxPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
        const userMaxPrice = Number(event.target.value);
        let maxPrice = (userMaxPrice>9999.99) ? 9999.99 : userMaxPrice;
        maxPrice = (maxPrice<0) ? 0 : maxPrice;
        setPopUpFilters(prevFilters => {
            return { ...prevFilters, maxPrice: maxPrice };
        });
    }

    const updateMinPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
        const userMinPrice = Number(event.target.value);
        let minPrice = (userMinPrice>9999.99) ? 9999.99 : userMinPrice;
        minPrice = (minPrice<0) ? 0 : minPrice;
        setPopUpFilters(prevFilters => {
            return { ...prevFilters, minPrice: minPrice };
        });
    }

    const updateFilters = () => {
        setFilters(popUpFilters);
        msContext.closeMenu();
    }

    return (
        <div className={shopStyles.filtersContainer}>
            <h3 style={{fontWeight: 500}}>Filters</h3>
            <div className={shopStyles.filter}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
                    <SizeFilter filters={popUpFilters} update={updateSizes} />
                    <GenderFilter filters={popUpFilters} update={updateGender} />
                </div>

                <Categories filters={popUpFilters} update={updateCategory} />

                <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
                    <MaxPrice filters={popUpFilters} update={updateMaxPrice} />
                    <MinPrice filters={popUpFilters} update={updateMinPrice} />
                </div>
                
            </div>
            <button onClick={updateFilters}>Update Filters</button>
        </div>
    );
}



export function CategoryFilters({ filters, setFilters }: FiltersType) {
    const msContext = useMenuShadowContext();
    const openPopUp = () => {
        msContext.setContent(<CategoryFiltersPopUp filters={filters} setFilters={setFilters} />);
        msContext.openMenu();
    }
    return <button onClick={openPopUp}>Filters</button>;
}

export function CategoryFiltersPopUp({ filters, setFilters }: FiltersType ) {
    const [popUpFilters, setPopUpFilters] = useState<UserFiltersType>(filters);
    const msContext = useMenuShadowContext();

    const updateSizes = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        setPopUpFilters(prevFilters => {
            const sizes = prevFilters.sizes;
            const newSizesArr = checked ? [...sizes, value] : sizes.filter(val => val !== value);
            return { ...prevFilters, sizes: newSizesArr };
        });
    }

    const updateGender = (event: React.ChangeEvent<HTMLInputElement>) => {
        const gender = event.target.value;
        setPopUpFilters(prevFilters => {
            return { ...prevFilters, gender: gender };
        });
    }

    const updateMaxPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
        const userMaxPrice = Number(event.target.value);
        let maxPrice = (userMaxPrice>9999.99) ? 9999.99 : userMaxPrice;
        maxPrice = (maxPrice<0) ? 0 : maxPrice;
        setPopUpFilters(prevFilters => {
            return { ...prevFilters, maxPrice: maxPrice };
        });
    }

    const updateMinPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
        const userMinPrice = Number(event.target.value);
        let minPrice = (userMinPrice>9999.99) ? 9999.99 : userMinPrice;
        minPrice = (minPrice<0) ? 0 : minPrice;
        setPopUpFilters(prevFilters => {
            return { ...prevFilters, minPrice: minPrice };
        });
    }

    const updateFilters = () => {
        setFilters(popUpFilters);
        msContext.closeMenu();
    }

    return (
        <div className={shopStyles.filtersContainer}>
            <h3 style={{fontWeight: 500}}>Filters</h3>
            <div className={shopStyles.filter}>
                <SizeFilter filters={popUpFilters} update={updateSizes} />
                <GenderFilter filters={popUpFilters} update={updateGender} />
                <MaxPrice filters={popUpFilters} update={updateMaxPrice} />
                <MinPrice filters={popUpFilters} update={updateMinPrice} />
            </div>
            <button onClick={updateFilters}>Update Filters</button>
        </div>
    );
}



interface FilterType {
    filters: UserFiltersType,
    update: (e: React.ChangeEvent<HTMLInputElement>)=>void
}

function SizeFilter({ filters, update }: FilterType) {
    return (
        <div className={shopStyles.filterItem} style={{flexDirection: 'column'}}>
            <h4>Sizes: </h4>
            {CLOTHING_SIZES.map((size, i) => (
                <div key={i} className={shopStyles.filterChoice}>
                    <input type='checkbox' name='sizes' value={size} checked={filters.sizes.includes(size)} onChange={update} />
                    <h5>{size}</h5>
                </div>
            ))}
        </div>
    );
}

function GenderFilter({ filters, update }: FilterType) {
    return (
        <div className={shopStyles.filterItem} style={{flexDirection: 'column'}}>
            <h4>Gender: </h4>
            {GENDERS.map((gender, i) => (
                <div key={i} className={shopStyles.filterChoice}>
                    <input type='radio' name='gender' value={gender} checked={filters.gender==gender} onChange={update} />
                    <h5>{gender}</h5>
                </div>
            ))}
        </div>
    );
}

function Categories({ filters, update }: FilterType) {
    return (
        <div className={shopStyles.filterItem} style={{flexDirection: 'column'}}>
            <h4>Categories: </h4>
            {CATEGORIES.map((cat, i) => (
                <div key={i} className={shopStyles.filterChoice}>
                    <input type='checkbox' name='cats' value={cat.link} checked={filters.categories.includes(cat.link)} onChange={update} />
                    <h5>{cat.title}</h5>
                </div>
            ))}
        </div>
    );
}

function MaxPrice({ filters, update }: FilterType) {
    return (
        <div className={shopStyles.filterItem} style={{flexDirection: 'column'}}>
            <h4>Max Price: </h4>
            <input style={{fontSize: 'min(2.7vw, 0.8em)'}} type='number' placeholder='0.01' min='0.00' step='0.01' max='9999.99' defaultValue={filters.maxPrice} onBlur={update} />
        </div>
    );
}

function MinPrice({ filters, update }: FilterType) {
    return (
        <div className={shopStyles.filterItem} style={{flexDirection: 'column'}}>
            <h4>Min Price: </h4>
            <input style={{fontSize: 'min(2.7vw, 0.8em)'}} type='number' placeholder='0.01' min='0.00' step='0.01' max='9999.99' defaultValue={filters.minPrice} onBlur={update} />
        </div>
    );
}