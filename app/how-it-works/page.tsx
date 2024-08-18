import hiwStyles from '@styles/pages/how-it-works.module.css';


export default function Page() {
    const steps: Step[] = [
        {title: '1) Post an item', imgSrc: '/steps/1.png', subtitle: '$1/month posted, discounts available.'},
        {title: '2) See interested buyers', imgSrc: '/steps/2.png', subtitle: 'They will appear in your email inbox.'},
        {title: '3) Meet in person or ship', imgSrc: '/steps/3.png', subtitle: 'BuyIllini takes no transaction fee!'}
    ]

    return (
        <div className={hiwStyles.container}>
            <h1 style={{fontWeight: 500}}>How it Works</h1>
            <div className={hiwStyles.stepContainers}>
                {steps.map((step, i) => <Step key={i} step={step} />)}
            </div>
        </div>
    );
}

interface Step {
    title: string,
    imgSrc: string,
    subtitle: string
}

function Step({ step }: { step: Step } ) {
    const { title, imgSrc, subtitle} = step;
    return (
        <div className={hiwStyles.step}>
            <h3>{title}</h3>
            <img style={{width: '100%', backgroundColor: 'white', borderRadius: '15px'}} src={imgSrc} />
            <h4 style={{color: 'var(--grey)', textAlign: 'center'}}>{subtitle}</h4>
        </div>
    );
}