import { Reloader } from '@components/providers/Reloader';
import { Auth } from '@components/providers/Auth';
import { MenuShadow } from '@components/providers/MenuShadow';

import { cookies } from 'next/headers';



export default function Providers({ children }: { children: React.ReactNode }) {
    const cookie = cookies().get('authtoken');

    return (
        <Reloader>
        <Auth cookie={cookie}>
        <MenuShadow>
            {children}
        </MenuShadow>
        </Auth>
        </Reloader>
    );
}