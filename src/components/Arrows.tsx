
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import clsx from 'clsx';
import arrowStyles from '@styles/ui/arrow.module.css';



export default function PageArrows({ page, max, setPage }: { page: number, max: number, setPage: React.Dispatch<React.SetStateAction<number>> }) {
    const arrowLeft = clsx({
        [arrowStyles.arrow]: true,
        [arrowStyles.hidden]: (page<=1)
    });

    const arrowRight = clsx({
        [arrowStyles.arrow]: true,
        [arrowStyles.hidden]: (page>=max)
    });


    // No results found, so display a 1 only
    if (max==0) {
        return (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <h5>1</h5>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <IoIosArrowBack className={arrowLeft} onClick={()=>setPage(page-1)} />

            {page!=1 && <h5 className={arrowStyles.otherPages} onClick={() => setPage(1)}>{1}</h5>}
            {page-3>1 && <h5>...</h5>}

            {page-2>1 && <h5 className={arrowStyles.otherPages} onClick={() => setPage(page-2)}>{page-2}</h5>}
            {page-1>1 && <h5 className={arrowStyles.otherPages} onClick={() => setPage(page-1)}>{page-1}</h5>}
            <h5>{page}</h5>
            {page+1<max && <h5 className={arrowStyles.otherPages} onClick={() => setPage(page+1)}>{page+1}</h5>}
            {page+2<max && <h5 className={arrowStyles.otherPages} onClick={() => setPage(page+2)}>{page+2}</h5>}

            {page+3<max && <h5>...</h5>}
            {page!=max && <h5 className={arrowStyles.otherPages} onClick={() => setPage(max)}>{max}</h5>}

            <IoIosArrowForward className={arrowRight} onClick={()=>setPage(page+1)} />
        </div>
    );
}