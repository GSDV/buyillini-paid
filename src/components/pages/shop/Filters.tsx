'use client'

import { CATEGORIES, CLOTHING_SIZES, GENDERS } from '@util/global';

import shopStyles from '@styles/pages/shop.module.css';

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

export function Filters({ filters, setFilters }: FiltersType ) {
    const updateCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        setFilters(prevFilters => {
            const categories = prevFilters.categories;
            const newCategoriesArr = checked ? [...categories, value] : categories.filter(val => val !== value);
            return { ...prevFilters, categories: newCategoriesArr };
        });
    }

    const updateSizes = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        setFilters(prevFilters => {
            const sizes = prevFilters.sizes;
            const newSizesArr = checked ? [...sizes, value] : sizes.filter(val => val !== value);
            return { ...prevFilters, sizes: newSizesArr };
        });
    }

    const updateGender = (event: React.ChangeEvent<HTMLInputElement>) => {
        const gender = event.target.value;
        setFilters(prevFilters => {
            return { ...prevFilters, gender: gender };
        });
    }

    const updateMaxPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
        const userMaxPrice = Number(event.target.value);
        let maxPrice = (userMaxPrice>9999.99) ? 9999.99 : userMaxPrice;
        maxPrice = (maxPrice<0) ? 0 : maxPrice;
        setFilters(prevFilters => {
            return { ...prevFilters, maxPrice: maxPrice };
        });
    }

    const updateMinPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
        const userMinPrice = Number(event.target.value);
        let minPrice = (userMinPrice>9999.99) ? 9999.99 : userMinPrice;
        minPrice = (minPrice<0) ? 0 : minPrice;
        setFilters(prevFilters => {
            return { ...prevFilters, minPrice: minPrice };
        });
    }

    return (
        <div className={shopStyles.filtersContainer}>
            <h3 style={{fontWeight: 500}}>Filters</h3>
            <div className={shopStyles.filter}>
                <SizeFilter filters={filters} update={updateSizes} />
                <GenderFilter filters={filters} update={updateGender} />
                <Categories filters={filters} update={updateCategory} />
                <MaxPrice filters={filters} update={updateMaxPrice} />
                <MinPrice filters={filters} update={updateMinPrice} />
            </div>
        </div>
    );
}



export function CategoryFilters({ filters, setFilters }: FiltersType ) {
    const updateSizes = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        setFilters(prevFilters => {
            const sizes = prevFilters.sizes;
            const newSizesArr = checked ? [...sizes, value] : sizes.filter(val => val !== value);
            return { ...prevFilters, sizes: newSizesArr };
        });
    }

    const updateGender = (event: React.ChangeEvent<HTMLInputElement>) => {
        const gender = event.target.value;
        setFilters(prevFilters => {
            return { ...prevFilters, gender: gender };
        });
    }

    const updateMaxPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
        const userMaxPrice = Number(event.target.value);
        let maxPrice = (userMaxPrice>9999.99) ? 9999.99 : userMaxPrice;
        maxPrice = (maxPrice<0) ? 0 : maxPrice;
        setFilters(prevFilters => {
            return { ...prevFilters, maxPrice: maxPrice };
        });
    }

    const updateMinPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
        const userMinPrice = Number(event.target.value);
        let minPrice = (userMinPrice>9999.99) ? 9999.99 : userMinPrice;
        minPrice = (minPrice<0) ? 0 : minPrice;
        setFilters(prevFilters => {
            return { ...prevFilters, minPrice: minPrice };
        });
    }

    return (
        <div className={shopStyles.filtersContainer}>
            <h3 style={{fontWeight: 500}}>Filters</h3>
            <div className={shopStyles.filter}>
                <SizeFilter filters={filters} update={updateSizes} />
                <GenderFilter filters={filters} update={updateGender} />
                <MaxPrice filters={filters} update={updateMaxPrice} />
                <MinPrice filters={filters} update={updateMinPrice} />
            </div>
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