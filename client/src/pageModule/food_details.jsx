import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFoodDetails } from '../store/modules/food_details';

function FoodDetails({ name }) {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchFoodDetails(name))
    }, [dispatch, name])
    const foodDetails = useSelector(state => state.food.foodDetails);
    console.log(foodDetails);
    const iconStyle = { color: "Purple",  fontSize: "1.5em" }

    return (
        <div className='container'>
            <h1>Food Details, Name = {name}</h1>
            {foodDetails ? (
                foodDetails.map(item => (
                    <div key={item.name}>
                        <h2>{item.name}</h2>
                        <p><b>Carbohydrates:</b> {item.Carbohydrates}</p>
                        <p><b>Proteins:</b> {item.Proteins}</p>
                        <p><b>Fats:</b> {item.Fats}</p>
                        <p><b>Vitamins:</b> {item.Vitamins}</p>
                        <p><b>Minerals:</b> {item.Minerals}</p>
                        <p><b>Water:</b> {item.Water}</p>
                        {/* <img src={item.ImageName} alt='food image' /> */}
                    </div>
                ))
            ) : (
                <div>Data not found!</div>
            )}
        </div>
    )
}

export default FoodDetails;