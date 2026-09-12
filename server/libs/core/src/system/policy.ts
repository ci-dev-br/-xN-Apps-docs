export function Policy(content: any, pool_user_access_datas: any, policyName: string, restriction: (a: any) => any) {
    let request = pool_user_access_datas;
    let user = request?.user;
    let roles = user?.roles;
    let confiance = 0;

    if ('reading' in content
    ) {
        if (!roles?.includes(policyName)) {
            content.reading = restriction(content.reading)
        }
    }
    if ('writing' in content
    ) {

    }
    if ('consulting' in content
    ) {

    }
    return content
}