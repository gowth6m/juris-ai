from typing import Annotated, Any, Callable

from bson import ObjectId
from pydantic import BaseModel, ConfigDict
from pydantic_core import core_schema


class _ObjectIdPydanticAnnotation:
    """
    Custom Pydantic annotation for ObjectId to handle
    validation and serialization of ObjectId fields.
    """

    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: Callable[[Any], core_schema.CoreSchema],
    ) -> core_schema.CoreSchema:
        def validate_from_str(input_value: str | ObjectId) -> ObjectId:
            # If input is a string, convert it to ObjectId
            if isinstance(input_value, str):
                try:
                    return ObjectId(input_value)
                except Exception:
                    raise ValueError("Invalid ObjectId format")
            # If already an ObjectId, return as-is
            if isinstance(input_value, ObjectId):
                return input_value
            # Raise error if input is neither a string nor an ObjectId
            raise ValueError("Expected ObjectId or valid ObjectId string")

        # Define schema that validates and serializes ObjectId as string
        return core_schema.union_schema(
            [
                core_schema.is_instance_schema(ObjectId),
                core_schema.no_info_plain_validator_function(validate_from_str),
            ],
            serialization=core_schema.to_string_ser_schema(),
        )


PyObjectId = Annotated[ObjectId, _ObjectIdPydanticAnnotation]


class CoreBaseModel(BaseModel):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        populate_by_name=True,
        use_enum_values=True,
        from_attributes=True,
    )
