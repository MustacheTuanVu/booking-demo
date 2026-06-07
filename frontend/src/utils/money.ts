export const formatMoney = (money: any): any => {
    return money ? money.toLocaleString('vi') + ' đ' : 0 + 'đ'
  };
  