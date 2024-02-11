// const metaAccount = document.getElementById('metaAccount').innerHTML;

async function connect() {
    if (typeof window.ethereum !== 'undefined') {
    
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    
        if (accounts.length === 0) {
            alert('You need to create an Ethereum account to use this website.');
        } else {
    
            const selectedAccount = accounts[0];
            ethereum.enable();
            console.log(selectedAccount);
            // console.log(metaAccount);
            localStorage.setItem("metamaskAccount", selectedAccount);
            // if (selectedAccount != metaAccount)
            // {
            //     alert("Metamask id not matched");
            // }
        }
    
    } else {
        alert('Please install and enable MetaMask to use this website.');
    }
}
connect()